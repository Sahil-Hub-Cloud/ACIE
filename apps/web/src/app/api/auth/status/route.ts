import { NextResponse } from 'next/server';
import { isGitHubAppConfigured, getAppSlug, hasRepoCredentials } from '../../../../lib/github-app';

export const dynamic = 'force-dynamic';

/** Reports which integrations are actually configured. Never returns secrets. */
export async function GET() {
  const appConfigured = isGitHubAppConfigured();
  const slug = appConfigured ? await getAppSlug() : null;

  return NextResponse.json({
    oauth: {
      configured: Boolean(
        (process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID) &&
          process.env.GITHUB_CLIENT_SECRET
      ),
      // Safe to expose: the client id is public by design.
      clientId:
        process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || null,
      redirectUri: process.env.GITHUB_OAUTH_REDIRECT_URI || null,
    },
    githubApp: {
      configured: appConfigured,
      slug,
      installUrl: slug ? `https://github.com/apps/${slug}/installations/new` : null,
    },
    repoAccess: {
      // Either a GitHub App installation or a PAT can read repos.
      configured: hasRepoCredentials(),
      patFallback: Boolean(process.env.GITHUB_TOKEN),
    },
    webhooks: {
      configured: Boolean(process.env.GITHUB_WEBHOOK_SECRET),
      endpoint: '/api/webhooks/analyze',
    },
    database: {
      configured: Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN),
    },
    sessions: {
      configured: Boolean(process.env.JWT_SECRET),
    },
  });
}
