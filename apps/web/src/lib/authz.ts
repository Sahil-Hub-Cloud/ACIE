import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { readCookie, SESSION_COOKIE } from './session';

export interface SessionUser {
  userId: number;
  username: string;
  role: string;
}

/**
 * Resolve the authenticated caller from the httpOnly session cookie (or a
 * Bearer token for non-browser clients). Returns null when absent/invalid —
 * callers must treat null as 401.
 */
export function getSessionUser(req: Request): SessionUser | null {
  try {
    const authHeader = req.headers.get('Authorization');
    const bearer = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;
    const token = bearer ?? readCookie(req, SESSION_COOKIE);
    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    const decoded = jwt.verify(token, secret) as {
      userId?: number;
      username?: string;
      role?: string;
    };
    if (typeof decoded.userId !== 'number') return null;

    return {
      userId: decoded.userId,
      username: decoded.username ?? 'unknown',
      role: decoded.role ?? 'developer',
    };
  } catch {
    return null;
  }
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

/**
 * Tenant scope: a repo is visible when the caller claimed its installation
 * (setup binding) or created it manually. Everything else — repos, analyses,
 * graphs — joins through this predicate, so a valid login never reads another
 * tenant's data.
 */
export const VISIBLE_REPO_SQL =
  '(installation_id IN (SELECT installation_id FROM installations WHERE setup_user_id = ?) OR created_by_user_id = ?)';

export function visibleRepoArgs(user: SessionUser): number[] {
  return [user.userId, user.userId];
}

/** Analyses scoped to repos the caller can see. */
export const VISIBLE_ANALYSIS_SQL =
  'repo_full_name IN (SELECT full_name FROM repos WHERE ' + VISIBLE_REPO_SQL + ')';
