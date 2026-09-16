import { NextResponse } from 'next/server';
import { getAppSlug, isGitHubAppConfigured } from '../../../../../lib/github-app';
import { getRequestOrigin } from '../../../../../lib/origin';

export const dynamic = 'force-dynamic';

/**
 * Sends the user to GitHub to install (or re-configure) the app.
 * GitHub then redirects to the app's Setup URL: /api/auth/github/setup
 */
export async function GET(req: Request) {
  const origin = getRequestOrigin(req);

  if (!isGitHubAppConfigured()) {
    const fallback = new URL('/login', origin);
    fallback.searchParams.set('error', 'app_not_configured');
    fallback.searchParams.set(
      'error_description',
      'GitHub App is not configured. Set GITHUB_APP_ID and GITHUB_APP_PRIVATE_KEY.'
    );
    return NextResponse.redirect(fallback.toString());
  }

  const slug = await getAppSlug();
  if (!slug) {
    const fallback = new URL('/login', origin);
    fallback.searchParams.set('error', 'app_slug_unknown');
    fallback.searchParams.set(
      'error_description',
      'Could not resolve the GitHub App slug. Set GITHUB_APP_SLUG to your app slug.'
    );
    return NextResponse.redirect(fallback.toString());
  }

  return NextResponse.redirect(`https://github.com/apps/${slug}/installations/new`);
}
