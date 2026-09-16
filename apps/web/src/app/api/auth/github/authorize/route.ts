import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export const dynamic = 'force-dynamic';

const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

const OAUTH_STATE_COOKIE = 'acie_oauth_state';

/**
 * Starts the GitHub OAuth dance.
 *
 * This lives on the server so the client never needs a build-time
 * `NEXT_PUBLIC_GITHUB_CLIENT_ID` — changing the client id no longer
 * requires a rebuild, and the id can never drift from the server one.
 */
export async function GET(req: Request) {
  const requestUrl = new URL(req.url);
  const next = requestUrl.searchParams.get('next') || '/repos';

  if (!GITHUB_CLIENT_ID) {
    const fallback = new URL('/login', requestUrl.origin);
    fallback.searchParams.set('error', 'oauth_not_configured');
    fallback.searchParams.set(
      'error_description',
      'GitHub sign-in is not configured yet. Add GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to the server environment.'
    );
    return NextResponse.redirect(fallback.toString());
  }

  // Behind a proxy (Vercel) req.url is the internal host, so prefer the
  // forwarded host header to build the exact redirect_uri GitHub expects.
  const forwardedHost =
    req.headers.get('x-forwarded-host') || req.headers.get('host');
  const forwardedProto =
    req.headers.get('x-forwarded-proto') ||
    (forwardedHost?.startsWith('localhost') ? 'http' : 'https');
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestUrl.origin;
  // Must match the OAuth App's "Authorization callback URL" byte-for-byte.
  // Override with GITHUB_OAUTH_REDIRECT_URI when the registered URL differs
  // from the host serving this deploy (custom domains, preview builds, etc.).
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
