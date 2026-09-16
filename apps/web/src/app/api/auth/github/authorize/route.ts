import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getRequestOrigin } from '../../../../../lib/origin';

export const dynamic = 'force-dynamic';

const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

const OAUTH_STATE_COOKIE = 'acie_oauth_state';

/**
 * Starts the GitHub user-authorization flow.
 *
 * Works with both a classic OAuth App and a GitHub App — both use the same
 * authorize endpoint and the same client id / secret pair. A GitHub App can
 * register up to 10 callback URLs, so preview deployments and custom domains
 * can each be allowlisted without code changes.
 */
export async function GET(req: Request) {
  const origin = getRequestOrigin(req);
  const requestUrl = new URL(req.url);
  const next = requestUrl.searchParams.get('next') || '/repos';

  if (!GITHUB_CLIENT_ID) {
    const fallback = new URL('/login', origin);
    fallback.searchParams.set('error', 'oauth_not_configured');
    fallback.searchParams.set(
      'error_description',
      'GitHub sign-in is not configured yet. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to the server environment.'
    );
    return NextResponse.redirect(fallback.toString());
  }

  // Must match a registered callback URL byte-for-byte.
  const redirectUri = process.env.GITHUB_OAUTH_REDIRECT_URI || `${origin}/login`;
  const state = `${randomBytes(16).toString('hex')}:${encodeURIComponent(next)}`;

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set('scope', 'read:user user:email');
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authorizeUrl.toString());
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes
  });
  return response;
}
