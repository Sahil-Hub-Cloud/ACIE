import { NextResponse } from 'next/server';
import { get } from '../../../../../lib/db';
import {
  getSessionUser,
  unauthorized,
  visibleRepoArgs,
  VISIBLE_REPO_SQL,
} from '../../../../../lib/authz';
import { RepoRow } from '../../../../../lib/repo-shape';

export const dynamic = 'force-dynamic';

/**
 * Honest 501: indexing runs in the local CLI today. A fabricated 200 would
 * tell the user their repo is being scanned when nothing is running.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
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
      message:
        'Server-side indexing is not available yet. Run the ACIE CLI (`acie index`) locally against this repository.',
    },
    { status: 501 }
  );
}
