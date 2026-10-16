import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import jwt from 'jsonwebtoken';

// The read routes use the shared db helpers; mock them directly so no
// Turso instance is needed. Auth (lib/authz) stays real on purpose — the
// point of these tests is that authn/authz actually gate the data.
vi.mock('../lib/db', () => ({
  all: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
  getDb: vi.fn(() => null),
}));

import { all, get, run } from '../lib/db';
import { GET as listRepos, POST as createRepo } from '../app/api/repos/route';
import { GET as fetchRepo, DELETE as removeRepo } from '../app/api/repos/[id]/route';
import { GET as fetchGraph } from '../app/api/repos/[id]/graph/route';
import { POST as requestIndex } from '../app/api/repos/[id]/index/route';
import { GET as listAnalyses } from '../app/api/analysis/route';
import { GET as fetchAnalysis } from '../app/api/analysis/[id]/route';

const SECRET = 'read-api-test-secret';
process.env.JWT_SECRET = SECRET;

const sessionToken = jwt.sign(
  { userId: 1, username: 'alice', role: 'developer' },
  SECRET
);
const AUTH = { cookie: `acie_session=${sessionToken}` };

const jsonRequest = (url: string, method: string, body: unknown) =>
  new Request(url, {
    method,
    headers: { ...AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

const repoRow = {
  id: 3,
  installation_id: 42,
  owner: 'acme',
  name: 'widgets',
  full_name: 'acme/widgets',
  url: 'https://github.com/acme/widgets',
  language: null,
  is_monorepo: 0,
  monorepo_tool: null,
  indexed_at: null,
  created_by_user_id: null,
  created_at: '2026-01-01 00:00:00',
};

const analysisRow = {
  id: 5,
  repo_id: 3,
  repo_full_name: 'acme/widgets',
  pr_number: 7,
  pr_url: 'https://github.com/acme/widgets/pull/7',
  pr_title: 'Refactor date utils',
  pr_author: 'octocat',
  risk_score: 70,
  risk_level: 'high',
  changed_files: JSON.stringify([
    'legacy/string.ts',
    { filename: 'src/app.ts', status: 'added', additions: 4, deletions: 0 },
  ]),
  impacted_services: JSON.stringify(['api']),
  blast_radius: JSON.stringify({ services: [{ name: 'api' }], totalImpactedFiles: 2 }),
  recommendations: JSON.stringify(['Review callers of formatDate']),
  head_sha: 'abc123',
  pr_updated_at: null,
  created_at: '2026-01-02 00:00:00',
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.JWT_SECRET = SECRET;
});

afterEach(() => {
  delete process.env.JWT_SECRET;
});

describe('session gating', () => {
  it('rejects analysis list without a session', async () => {
    const response = await listAnalyses(new Request('http://localhost/api/analysis'));
    expect(response.status).toBe(401);
    expect(all).not.toHaveBeenCalled();
  });

  it('rejects repos list without a session', async () => {
    const response = await listRepos(new Request('http://localhost/api/repos'));
    expect(response.status).toBe(401);
  });

  it('rejects a garbage session cookie', async () => {
    const response = await listAnalyses(
      new Request('http://localhost/api/analysis', {
        headers: { cookie: 'acie_session=not-a-jwt' },
      })
    );
    expect(response.status).toBe(401);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ userId: 1, username: 'mallory', role: 'admin' }, 'wrong');
    const response = await fetchAnalysis(
      new Request('http://localhost/api/analysis/5', {
        headers: { cookie: `acie_session=${forged}` },
      }),
      { params: { id: '5' } }
    );
    expect(response.status).toBe(401);
    expect(get).not.toHaveBeenCalled();
  });
});

describe('GET /api/repos', () => {
  it('returns tenant-scoped repos with honest field mapping', async () => {
    vi.mocked(all).mockResolvedValue([repoRow]);

    const response = await listRepos(
      new Request('http://localhost/api/repos', { headers: AUTH })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('x-acie-contract-version')).toBe('1');

    const [sql, args] = vi.mocked(all).mock.calls[0] as [string, number[]];
    expect(sql).toContain('setup_user_id');
    expect(args).toEqual([1, 1]);

    const body = await response.json();
    expect(body[0]).toMatchObject({
      id: 3,
      github_id: null,
      language: 'Unknown',
      is_monorepo: false,
      last_indexed_at: null,
      full_name: 'acme/widgets',
    });
  });
});

describe('POST /api/repos', () => {
  it('validates the body', async () => {
    const response = await createRepo(
      jsonRequest('http://localhost/api/repos', 'POST', { name: 'w', owner: 'a' })
    );
    expect(response.status).toBe(400);
    expect(run).not.toHaveBeenCalled();
  });

  it('rejects non-http urls', async () => {
    const response = await createRepo(
      jsonRequest('http://localhost/api/repos', 'POST', {
        name: 'widgets',
        owner: 'acme',
        url: 'javascript:alert(1)',
      })
    );
    expect(response.status).toBe(400);
  });

  it('binds the created repo to the authenticated user', async () => {
    vi.mocked(run).mockResolvedValue({ rows: [], rowsAffected: 1 } as never);
    vi.mocked(get).mockResolvedValue(repoRow);

    const response = await createRepo(
      jsonRequest('http://localhost/api/repos', 'POST', {
        name: 'widgets',
        owner: 'acme',
        url: 'https://github.com/acme/widgets',
        language: 'TypeScript',
        isMonorepo: true,
        monorepoTool: 'pnpm',
      })
    );
    expect(response.status).toBe(201);

    const [sql, args] = vi.mocked(run).mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('INSERT INTO repos');
    expect(args).toEqual([
      'acme',
      'widgets',
      'acme/widgets',
      'https://github.com/acme/widgets',
      'TypeScript',
      1,
      'pnpm',
      1, // created_by_user_id
    ]);

    const body = await response.json();
    expect(body.full_name).toBe('acme/widgets');
  });
});

describe('GET/DELETE /api/repos/[id]', () => {
  it('returns 404 for an id outside the tenancy', async () => {
    vi.mocked(get).mockResolvedValue(undefined);
    const response = await fetchRepo(
      new Request('http://localhost/api/repos/99', { headers: AUTH }),
      { params: { id: '99' } }
    );
    expect(response.status).toBe(404);
  });

  it('applies the tenant predicate on the lookup', async () => {
    vi.mocked(get).mockResolvedValue(repoRow);
    const response = await fetchRepo(
      new Request('http://localhost/api/repos/3', { headers: AUTH }),
      { params: { id: '3' } }
    );
    expect(response.status).toBe(200);

    const [sql, args] = vi.mocked(get).mock.calls[0] as [string, number[]];
    expect(sql).toContain('created_by_user_id');
    expect(args).toEqual([3, 1, 1]);
  });

  it('reports 404 when DELETE matches no visible row', async () => {
    vi.mocked(run).mockResolvedValue({ rows: [], rowsAffected: 0 } as never);
    const response = await removeRepo(
      new Request('http://localhost/api/repos/3', { method: 'DELETE', headers: AUTH }),
      { params: { id: '3' } }
    );
    expect(response.status).toBe(404);
  });

  it('deletes a visible row', async () => {
    vi.mocked(run).mockResolvedValue({ rows: [], rowsAffected: 1 } as never);
    const response = await removeRepo(
      new Request('http://localhost/api/repos/3', { method: 'DELETE', headers: AUTH }),
      { params: { id: '3' } }
    );
    expect(response.status).toBe(200);
    const [sql, args] = vi.mocked(run).mock.calls[0] as [string, number[]];
    expect(sql).toContain('DELETE FROM repos');
    expect(args).toEqual([3, 1, 1]);
  });
});

describe('graph and index endpoints', () => {
  it('returns an honest empty graph for a visible repo', async () => {
    vi.mocked(get).mockResolvedValue({ id: 3 });
    const response = await fetchGraph(
      new Request('http://localhost/api/repos/3/graph', { headers: AUTH }),
      { params: { id: '3' } }
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.nodes).toEqual([]);
    expect(body.edges).toEqual([]);
    expect(body.services).toEqual([]);
    expect(body.source).toBe('cli');
  });

  it('answers 501 for server-side indexing instead of faking success', async () => {
    vi.mocked(get).mockResolvedValue({ id: 3 });
    const response = await requestIndex(
      new Request('http://localhost/api/repos/3/index', {
        method: 'POST',
        headers: AUTH,
      }),
      { params: { id: '3' } }
    );
    expect(response.status).toBe(501);
    const body = await response.json();
    expect(body.message).toContain('acie index');
  });
});

describe('GET /api/analysis', () => {
  it('returns latest-per-PR items scoped to the tenant', async () => {
    vi.mocked(all).mockResolvedValue([analysisRow]);

    const response = await listAnalyses(
      new Request('http://localhost/api/analysis', { headers: AUTH })
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('x-acie-contract-version')).toBe('1');

    const [sql, args] = vi.mocked(all).mock.calls[0] as [string, number[]];
    expect(sql).toContain('MAX(b.id)');
    expect(sql).toContain('setup_user_id');
    expect(args).toEqual([1, 1]);

    const body = await response.json();
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      repo_name: 'acme/widgets',
      pr_number: 7,
      risk_level: 'high',
      impacted_services: ['api'],
    });
    // list contract carries no file payload
    expect(body[0].changed_files).toBeUndefined();
  });
});

describe('GET /api/analysis/[id]', () => {
  it('hides analyses outside the tenancy behind a 404', async () => {
    vi.mocked(get).mockResolvedValue(undefined);
    const response = await fetchAnalysis(
      new Request('http://localhost/api/analysis/5', { headers: AUTH }),
      { params: { id: '5' } }
    );
    expect(response.status).toBe(404);

    const [sql, args] = vi.mocked(get).mock.calls[0] as [string, number[]];
    expect(sql).toContain('setup_user_id');
    expect(args).toEqual([5, 1, 1]);
  });

  it('returns the normalized v1 detail for a visible analysis', async () => {
    vi.mocked(get).mockResolvedValue(analysisRow);

    const response = await fetchAnalysis(
      new Request('http://localhost/api/analysis/5', { headers: AUTH }),
      { params: { id: '5' } }
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('x-acie-contract-version')).toBe('1');

    const body = await response.json();
    expect(body.changed_files).toEqual([
      { filename: 'legacy/string.ts', status: 'changed', additions: 0, deletions: 0 },
      { filename: 'src/app.ts', status: 'added', additions: 4, deletions: 0 },
    ]);
    expect(body.recommendations).toEqual(['Review callers of formatDate']);
    expect(body.blast_radius.totalImpactedFiles).toBe(2);
    expect(body.risk_score).toBe(70);
  });

  it('rejects non-numeric ids without touching the database', async () => {
    const response = await fetchAnalysis(
      new Request('http://localhost/api/analysis/abc', { headers: AUTH }),
      { params: { id: 'abc' } }
    );
    expect(response.status).toBe(404);
    expect(get).not.toHaveBeenCalled();
  });
});
