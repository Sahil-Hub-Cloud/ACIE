import { NextResponse } from 'next/server';
import { get } from '../../../../../lib/db';
import {
  getSessionUser,
  unauthorized,
  visibleRepoArgs,
  VISIBLE_REPO_SQL,
} from '../../../../../lib/authz';
import { RepoRow } from '../../../../../lib/repo-shape';
import { CONTRACT_HEADERS } from '../../../../../lib/analysis-contract';

export const dynamic = 'force-dynamic';

/**
 * Server-side graph storage does not exist yet — the dependency graph lives
 * in the local CLI's SQLite artifact. This endpoint is honest about that:
 * tenants get an empty graph rather than another tenant's data (the previous
 * global stub returned the same unscoped arrays to everyone).
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser(req);
  if (!user) return unauthorized();

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Repository not found' }, { status: 404 });
  }

  const row = await get<RepoRow>(
    `SELECT id FROM repos WHERE id = ? AND ${VISIBLE_REPO_SQL}`,
    [id, ...visibleRepoArgs(user)]
  );
  if (!row) return NextResponse.json({ message: 'Repository not found' }, { status: 404 });

  return NextResponse.json(
    {
      nodes: [],
      edges: [],
      services: [],
      source: 'cli',
      note: 'Graph artifacts are produced locally by the ACIE CLI (`acie index`); server-side indexing is not available yet.',
    },
    { headers: CONTRACT_HEADERS }
  );
}
