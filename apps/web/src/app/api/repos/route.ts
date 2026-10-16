import { NextResponse } from 'next/server';
import { all, get, run } from '../../../lib/db';
import {
  getSessionUser,
  unauthorized,
  visibleRepoArgs,
  VISIBLE_REPO_SQL,
} from '../../../lib/authz';
import { mapRepo, RepoRow } from '../../../lib/repo-shape';
import { CONTRACT_HEADERS } from '../../../lib/analysis-contract';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = getSessionUser(req);
  if (!user) return unauthorized();

  const rows = await all<RepoRow>(
    `SELECT * FROM repos WHERE ${VISIBLE_REPO_SQL} ORDER BY created_at DESC, id DESC`,
    visibleRepoArgs(user)
  );
  return NextResponse.json(rows.map(mapRepo), { headers: CONTRACT_HEADERS });
}

export async function POST(req: Request) {
  const user = getSessionUser(req);
  if (!user) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const owner = typeof body.owner === 'string' ? body.owner.trim() : '';
  const url = typeof body.url === 'string' ? body.url.trim() : '';
  const language =
    typeof body.language === 'string' && body.language.trim() ? body.language.trim() : null;
  const monorepoTool =
    typeof body.monorepoTool === 'string' && body.monorepoTool.trim()
      ? body.monorepoTool.trim()
      : null;

  if (!name || !owner || !url) {
    return NextResponse.json(
      { message: 'name, owner and url are required' },
      { status: 400 }
    );
  }
  if (!/^https?:\/\//.test(url)) {
    return NextResponse.json({ message: 'url must be http(s)' }, { status: 400 });
  }

  const fullName = `${owner}/${name}`;
  const isMonorepo = body.isMonorepo === true || body.isMonorepo === 'true' ? 1 : 0;

  try {
    await run(
      `INSERT INTO repos (owner, name, full_name, url, language, is_monorepo, monorepo_tool, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [owner, name, fullName, url, language, isMonorepo, monorepoTool, user.userId]
    );
  } catch (error) {
    console.error('[ACIE] Repo insert failed:', (error as Error).message);
    return NextResponse.json(
      { message: 'Could not register repository' },
      { status: 500 }
    );
  }

  const created = await get<RepoRow>(
    'SELECT * FROM repos WHERE full_name = ? AND created_by_user_id = ? ORDER BY id DESC LIMIT 1',
    [fullName, user.userId]
  );
  if (!created) {
    return NextResponse.json(
      { message: 'Could not register repository' },
      { status: 500 }
    );
  }
  return NextResponse.json(mapRepo(created), { status: 201, headers: CONTRACT_HEADERS });
}
