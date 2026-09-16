import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/** Reports which integrations are actually configured. Never returns secrets. */
export async function GET() {
  const oauthConfigured = Boolean(
    (process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID) &&
      process.env.GITHUB_CLIENT_SECRET
  );

  return NextResponse.json({
    oauth: {
      configured: oauthConfigured,
      // Safe to expose: the client id is public by design.
      clientId:
        process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || null,
    },
    webhooks: {
      configured: Boolean(process.env.GITHUB_WEBHOOK_SECRET),
    },
    database: {
      configured: Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN),
    },
    sessions: {
      configured: Boolean(process.env.JWT_SECRET),
    },
  });
}
