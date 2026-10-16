import { NextResponse } from 'next/server';
import { all } from '../../../lib/db';
import {
  getSessionUser,
  unauthorized,
  visibleRepoArgs,
  VISIBLE_ANALYSIS_SQL,
} from '../../../lib/authz';
import {
  CONTRACT_HEADERS,
  normalizeAnalysisListItem,
} from '../../../lib/analysis-contract';

export const dynamic = 'force-dynamic';

/**
 * Latest analysis per PR (id = newest stored row), scoped to repositories the
 * caller may see. Shape follows the v1 analysis contract (lib/analysis-contract).
 */
export async function GET(req: Request) {
  const user = getSessionUser(req);
  if (!user) return unauthorized();

  const rows = await all<Record<string, unknown>>(
    `SELECT a.* FROM analyses a
     WHERE ${VISIBLE_ANALYSIS_SQL}
       AND a.id = (
         SELECT MAX(b.id) FROM analyses b
         WHERE b.repo_full_name = a.repo_full_name AND b.pr_number = a.pr_number
       )
     ORDER BY a.created_at DESC, a.id DESC
     LIMIT 200`,
    visibleRepoArgs(user)
  );

  return NextResponse.json(rows.map(normalizeAnalysisListItem), {
    headers: CONTRACT_HEADERS,
  });
}
