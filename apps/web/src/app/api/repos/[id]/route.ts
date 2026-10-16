import { NextResponse } from 'next/server';
import { get, run } from '../../../../lib/db';
import {
  getSessionUser,
  unauthorized,
  visibleRepoArgs,
  VISIBLE_REPO_SQL,
} from '../../../../lib/authz';
import { mapRepo, RepoRow } from '../../../../lib/repo-shape';
import { CONTRACT_HEADERS } from '../../../../lib/analysis-contract';

export const dynamic = 'force-dynamic';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser(req);
  if (!user) return unauthorized();

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ message: 'Repository not found' }, { status: 404 });

  const row = await get<RepoRow>(
    `SELECT * FROM repos WHERE id = ? AND ${VISIBLE_REPO_SQL}`,
    [id, ...visibleRepoArgs(user)]
  );
  if (!row) return NextResponse.json({ message: 'Repository not found' }, { status: 404 });

  return NextResponse.json(mapRepo(row), { headers: CONTRACT_HEADERS });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser(req);
  if (!user) return unauthorized();

  const id = parseId(params.id);
  if (!id) return NextResponse.json({ message: 'Repository not found' }, { status: 404 });

  const result = await run(
    `DELETE FROM repos WHERE id = ? AND ${VISIBLE_REPO_SQL}`,
    [id, ...visibleRepoArgs(user)]
  );
  if (result.rowsAffected === 0) {
    return NextResponse.json({ message: 'Repository not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, id });
}
