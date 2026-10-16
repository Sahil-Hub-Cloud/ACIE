import { NextResponse } from 'next/server';
import { get } from '../../../../lib/db';
import {
  getSessionUser,
  unauthorized,
  visibleRepoArgs,
  VISIBLE_ANALYSIS_SQL,
} from '../../../../lib/authz';
import {
  CONTRACT_HEADERS,
  normalizeAnalysisDetail,
} from '../../../../lib/analysis-contract';

export const dynamic = 'force-dynamic';

/**
 * Single persisted analysis. An id outside the caller's tenancy is reported
 * as 404 (not 403) so valid logins cannot enumerate other tenants' records.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = getSessionUser(req);
  if (!user) return unauthorized();

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ message: 'Analysis not found' }, { status: 404 });
  }

  const row = await get<Record<string, unknown>>(
    `SELECT a.* FROM analyses a WHERE a.id = ? AND ${VISIBLE_ANALYSIS_SQL}`,
    [id, ...visibleRepoArgs(user)]
  );
  if (!row) return NextResponse.json({ message: 'Analysis not found' }, { status: 404 });

  return NextResponse.json(normalizeAnalysisDetail(row), { headers: CONTRACT_HEADERS });
}
