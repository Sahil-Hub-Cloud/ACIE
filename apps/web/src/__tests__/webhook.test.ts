import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from 'vitest';
import crypto from 'crypto';

// The webhook only touches libSQL when a database is configured. Force a
// (mocked) client so tests can observe queries and inject rows; no real
// Turso instance is ever needed.
const dbState = vi.hoisted(() => {
  process.env.TURSO_DATABASE_URL = 'libsql://webhook-test';
  process.env.TURSO_AUTH_TOKEN = 'test-token';
  return {
    executed: [] as string[],
    analysisArgs: [] as unknown[][],
    handlers: [] as Array<(sql: string) => { rows: unknown[]; rowsAffected: number } | undefined>,
    reset() {
      this.executed = [];
      this.analysisArgs = [];
      this.handlers = [];
    },
  };
});

vi.mock('@libsql/client/web', () => ({
  createClient: () => ({
    // libSQL accepts both `execute('sql')` and `execute({ sql, args })`.
    execute: async (query: string | { sql: string; args?: unknown[] }) => {
      const sql = typeof query === 'string' ? query : query.sql;
      const args = typeof query === 'string' ? [] : query.args ?? [];
      dbState.executed.push(sql);
      if (sql.includes('INSERT INTO analyses')) dbState.analysisArgs.push(args);
      for (const handler of dbState.handlers) {
        const result = handler(sql);
        if (result) return result;
      }
      return { rows: [], rowsAffected: 0 };
    },
  }),
}));

import { POST, GET } from '../app/api/webhooks/analyze/route';

const WEBHOOK_SECRET = 'test-webhook-secret';
const ENDPOINT = 'https://acie.test/api/webhooks/analyze';

// ── Fixtures ────────────────────────────────────────────────────────────────

const CHANGED_FILES = [
  {
    filename: 'apps/web/src/lib/utils.ts',
    patch: [
      '@@ -1,3 +1,3 @@',
      '-export function formatDate(d: Date) {',
      '+function formatDate(d: Date) {',
    ].join('\n'),
  },
  {
    filename: 'README.md',
    patch: '@@ -1 +1 @@\n-old\n+new',
  },
];

const PR_PAYLOAD = {
  action: 'opened',
  installation: { id: 42 },
  repository: { full_name: 'acme/widgets' },
  pull_request: {
    number: 7,
    title: 'Refactor date utils',
    html_url: 'https://github.com/acme/widgets/pull/7',
    user: { login: 'octocat' },
  },
};

// ── Mock plumbing ───────────────────────────────────────────────────────────

interface RecordedCall {
  url: string;
  method: string;
  body?: string;
}

let calls: RecordedCall[] = [];
let existingComments: Array<{ id: number; body?: string }> = [];
const originalFetch = globalThis.fetch;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function installFetchMock() {
  calls = [];
  existingComments = [];

  globalThis.fetch = vi.fn(async (input: any, init: any = {}) => {
    const url = typeof input === 'string' ? input : String(input?.url ?? input);
    const method = String(init.method ?? 'GET').toUpperCase();
    calls.push({ url, method, body: typeof init.body === 'string' ? init.body : undefined });

    if (url.includes('/pulls/7/files')) return json(CHANGED_FILES);
    if (url.includes('/search/code')) {
      return json({ items: [{ path: 'apps/api/src/routes/login.route.ts' }] });
    }
    if (url.includes('/issues/7/comments') && method === 'GET') return json(existingComments);
    if (url.includes('/issues/7/comments') && method === 'POST') return json({ id: 101 });
    if (url.includes('/issues/comments/') && method === 'PATCH') return json({ id: 55 });

    throw new Error(`Unexpected fetch: ${method} ${url}`);
  }) as unknown as typeof globalThis.fetch;
}

function signedRequest(event: string, payload: unknown, query = '') {
  const body = JSON.stringify(payload);
  const signature =
    'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(body, 'utf8').digest('hex');

  return new Request(`${ENDPOINT}${query}`, {
    method: 'POST',
    headers: {
      'X-GitHub-Event': event,
      'X-Hub-Signature-256': signature,
      'Content-Type': 'application/json',
    },
    body,
  });
}

const commentPosts = () =>
  calls.filter((call) => call.method === 'POST' && call.url.includes('/issues/7/comments'));
const commentPatches = () => calls.filter((call) => call.method === 'PATCH');

beforeEach(() => {
  process.env.GITHUB_WEBHOOK_SECRET = WEBHOOK_SECRET;
  process.env.GITHUB_TOKEN = 'test-pat';
  delete process.env.GITHUB_APP_ID;
  delete process.env.GITHUB_APP_PRIVATE_KEY;
  dbState.reset();
  installFetchMock();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.GITHUB_WEBHOOK_SECRET;
  delete process.env.GITHUB_TOKEN;
});

afterAll(() => {
  delete process.env.TURSO_DATABASE_URL;
  delete process.env.TURSO_AUTH_TOKEN;
});

// ── Tests ───────────────────────────────────────────────────────────────────

describe('webhook signature verification', () => {
  it('health check reports the configured capabilities', async () => {
    const body = await (await GET()).json();
    expect(body.status).toBe('ACIE webhook online');
    expect(body.signatureVerification).toBe(true);
  });

  it('rejects a request with no signature', async () => {
    const response = await POST(
      new Request(ENDPOINT, {
        method: 'POST',
        headers: { 'X-GitHub-Event': 'ping', 'Content-Type': 'application/json' },
        body: '{"zen":"x"}',
      })
    );
    expect(response.status).toBe(401);
  });

  it('rejects a request with a tampered body', async () => {
    const body = '{"zen":"honest"}';
    const signature =
      'sha256=' + crypto.createHmac('sha256', WEBHOOK_SECRET).update(body, 'utf8').digest('hex');

    const response = await POST(
      new Request(ENDPOINT, {
        method: 'POST',
        headers: {
          'X-GitHub-Event': 'ping',
          'X-Hub-Signature-256': signature,
          'Content-Type': 'application/json',
        },
        // Same signature, different payload.
        body: '{"zen":"tampered"}',
      })
    );
    expect(response.status).toBe(401);
  });

  it('accepts a correctly signed ping and echoes the zen', async () => {
    const response = await POST(signedRequest('ping', { zen: 'Keep it logically awesome.' }));
    expect(response.status).toBe(200);
    expect((await response.json()).zen).toBe('Keep it logically awesome.');
  });

  it('fails closed in production when the webhook secret is unset', async () => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
    const previousNodeEnv = process.env.NODE_ENV;
    (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
    try {
      const response = await POST(
        new Request(ENDPOINT, {
          method: 'POST',
          headers: { 'X-GitHub-Event': 'ping', 'Content-Type': 'application/json' },
          body: '{"zen":"unsigned"}',
        })
      );
      expect(response.status).toBe(503);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = previousNodeEnv;
      process.env.GITHUB_WEBHOOK_SECRET = WEBHOOK_SECRET;
    }
  });

  it('still accepts unsigned requests in development when the secret is unset', async () => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
    try {
      const response = await POST(
        new Request(ENDPOINT, {
          method: 'POST',
          headers: { 'X-GitHub-Event': 'ping', 'Content-Type': 'application/json' },
          body: '{"zen":"local dev"}',
        })
      );
      expect(response.status).toBe(200);
    } finally {
      process.env.GITHUB_WEBHOOK_SECRET = WEBHOOK_SECRET;
    }
  });
});

describe('webhook event routing', () => {
  it('ignores pull_request actions it does not analyse', async () => {
    const response = await POST(
      signedRequest('pull_request', { action: 'closed', repository: {}, pull_request: {} })
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ignored).toBe(true);
    expect(body.action).toBe('closed');
  });

  it('ignores non pull_request events', async () => {
    const response = await POST(signedRequest('push', { ref: 'refs/heads/main' }));
    expect(response.status).toBe(200);
    expect((await response.json()).ignored).toBe(true);
  });

  it('acknowledges installation events', async () => {
    const response = await POST(
      signedRequest('installation', {
        action: 'created',
        installation: { id: 123, account: { login: 'acme', type: 'Organization' } },
        repositories: [{ id: 1 }],
      })
    );
    expect(response.status).toBe(200);
    expect((await response.json()).action).toBe('created');
  });

  it('refuses to analyse when no GitHub credentials exist', async () => {
    delete process.env.GITHUB_TOKEN;
    const response = await POST(signedRequest('pull_request', PR_PAYLOAD));
    expect(response.status).toBe(503);
  });
});

describe('webhook pull request analysis', () => {
  it('analyses the PR, scores it, and posts a comment', async () => {
    const response = await POST(signedRequest('pull_request', PR_PAYLOAD));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.prNumber).toBe(7);
    expect(body.changedFiles).toBe(1); // README.md is filtered out
    expect(body.entryPointsAffected).toBe(true);
    expect(body.impactedServices).toContain('api');
    expect(body.riskScore).toBeGreaterThan(0);
    expect(body.riskLevel).not.toBe('low');
    expect(body.comment).toBe('created');

    expect(commentPosts()).toHaveLength(1);
    const posted = commentPosts()[0].body ?? '';
    expect(posted).toContain('<!-- acie:blast-radius -->');
    expect(posted).toContain('ACIE Blast Radius Report');
    expect(posted).toContain('formatDate');
  });

  it('updates the existing ACIE comment instead of creating a duplicate', async () => {
    existingComments = [
      { id: 55, body: 'unrelated human review' },
      { id: 56, body: '<!-- acie:blast-radius -->\n## ⚡ ACIE Blast Radius Report — PR #7' },
    ];

    const response = await POST(signedRequest('pull_request', PR_PAYLOAD));
    const body = await response.json();

    expect(body.comment).toBe('updated');
    expect(commentPosts()).toHaveLength(0);
    expect(commentPatches()).toHaveLength(1);
    expect(commentPatches()[0].url).toContain('/issues/comments/56');
  });

  it('runs the analysis without commenting in dry-run mode', async () => {
    const response = await POST(signedRequest('pull_request', PR_PAYLOAD, '?dryRun=1'));
    const body = await response.json();

    expect(body.dryRun).toBe(true);
    expect(body.comment).toBe('skipped');
    expect(body.commentPreview).toContain('ACIE Blast Radius Report');
    expect(commentPosts()).toHaveLength(0);
    expect(commentPatches()).toHaveLength(0);
  });

  it('skips a PR that only touches non-source files', async () => {
    globalThis.fetch = vi.fn(async (input: any) => {
      const url = typeof input === 'string' ? input : String(input?.url ?? input);
      if (url.includes('/pulls/7/files')) {
        return json([{ filename: 'docs/guide.md', patch: '@@ -1 +1 @@\n-a\n+b' }]);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as unknown as typeof globalThis.fetch;

    const response = await POST(signedRequest('pull_request', PR_PAYLOAD));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ignored).toBe(true);
    expect(body.reason).toBe('No source files changed');
  });
});

describe('webhook persistence', () => {
  it('registers the repository and stores the analysis', async () => {
    const response = await POST(signedRequest('pull_request', PR_PAYLOAD));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.analysisStored).toBe(true);
    expect(dbState.executed.some((sql) => sql.includes('INSERT INTO repos'))).toBe(true);
    expect(dbState.executed.some((sql) => sql.includes('INSERT INTO analyses'))).toBe(true);
  });

  it('stores changed files with GitHub statuses and line counts', async () => {
    globalThis.fetch = vi.fn(async (input: any, init: any = {}) => {
      const url = typeof input === 'string' ? input : String(input?.url ?? input);
      const method = String(init.method ?? 'GET').toUpperCase();
      calls.push({ url, method, body: typeof init.body === 'string' ? init.body : undefined });

      if (url.includes('/pulls/7/files')) {
        return json([
          {
            filename: 'apps/web/src/lib/utils.ts',
            status: 'modified',
            additions: 12,
            deletions: 4,
            patch: '@@ -1,3 +1,3 @@\n-function a() {}\n+function a(x) {}',
          },
        ]);
      }
      if (url.includes('/search/code')) return json({ items: [] });
      if (url.includes('/issues/7/comments') && method === 'GET') return json([]);
      if (url.includes('/issues/7/comments') && method === 'POST') return json({ id: 1 });
      throw new Error(`Unexpected fetch: ${method} ${url}`);
    }) as unknown as typeof globalThis.fetch;

    const response = await POST(signedRequest('pull_request', PR_PAYLOAD));
    expect((await response.json()).analysisStored).toBe(true);

    const insert = dbState.executed.find((sql) => sql.includes('INSERT INTO analyses'));
    expect(insert).toBeDefined();
    // Column order: ... changed_files is the 9th value.
    const changedFiles = JSON.parse(String(dbState.analysisArgs[0][8]));
    expect(changedFiles).toEqual([
      {
        filename: 'apps/web/src/lib/utils.ts',
        status: 'modified',
        additions: 12,
        deletions: 4,
      },
    ]);
  });

  it('drops an out-of-order delivery instead of overwriting a newer head', async () => {
    dbState.handlers.push((sql) => {
      if (sql.includes('SELECT pr_updated_at')) {
        return {
          rows: [{ pr_updated_at: '2999-01-01T00:00:00Z' }],
          rowsAffected: 0,
        };
      }
      return undefined;
    });

    const payload = JSON.parse(JSON.stringify(PR_PAYLOAD));
    payload.pull_request.updated_at = '2026-01-01T00:00:00Z';

    const response = await POST(signedRequest('pull_request', payload));
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.analysisStored).toBe(false);
    expect(dbState.executed.some((sql) => sql.includes('INSERT INTO analyses'))).toBe(false);
  });
});

describe('webhook credential policy', () => {
  it('never substitutes the operator PAT when the GitHub App is configured', async () => {
    const { privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
    process.env.GITHUB_APP_ID = '123';
    process.env.GITHUB_APP_PRIVATE_KEY = privateKey.export({
      type: 'pkcs8',
      format: 'pem',
    }) as string;
    process.env.GITHUB_TOKEN = 'ghp_never_used_in_app_mode';

    const authHeaders: string[] = [];
    globalThis.fetch = vi.fn(async (input: any, init: any = {}) => {
      const url = typeof input === 'string' ? input : String(input?.url ?? input);
      const auth = new Headers(init.headers).get('Authorization') ?? '';
      authHeaders.push(auth);

      if (url.includes('/app/installations/42/access_tokens')) {
        return json({ message: 'mint failed' }, 500);
      }
      if (url.includes('/repos/acme/widgets/installation')) {
        return json({ message: 'Not Found' }, 404);
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as unknown as typeof globalThis.fetch;

    try {
      const response = await POST(signedRequest('pull_request', PR_PAYLOAD));
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body.error).toMatch(/PAT fallback is disabled/);
      expect(authHeaders.some((h) => h.includes('ghp_never_used_in_app_mode'))).toBe(false);
      expect(authHeaders.some((h) => h.startsWith('Bearer '))).toBe(true);
    } finally {
      delete process.env.GITHUB_APP_ID;
      delete process.env.GITHUB_APP_PRIVATE_KEY;
      installFetchMock();
    }
  });
});
