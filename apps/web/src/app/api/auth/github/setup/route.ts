import { NextResponse } from 'next/server';
import { run } from '../../../../../lib/db';
import { getRequestOrigin } from '../../../../../lib/origin';
import { getInstallationToken } from '../../../../../lib/github-app';

export const dynamic = 'force-dynamic';

/**
 * GitHub App "Setup URL" handler.
 *
 * After a user installs or reconfigures the app, GitHub redirects here with
 * `installation_id` and `setup_action`. We record the installation so the
 * webhook can map incoming PRs back to a workspace.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = getRequestOrigin(req);
  const installationId = Number(url.searchParams.get('installation_id'));
  const setupAction = url.searchParams.get('setup_action') ?? 'install';

  const destination = new URL('/repos', origin);

  if (!Number.isFinite(installationId) || installationId <= 0) {
    destination.searchParams.set('setup', 'missing_installation');
    return NextResponse.redirect(destination.toString());
  }

  let accountLogin: string | null = null;
  let accountType: string | null = null;
  let repositoryCount = 0;

  try {
    const token = await getInstallationToken(installationId);
    const response = await fetch(`https://api.github.com/installation/repositories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (response.ok) {
      const data = (await response.json()) as {
        total_count?: number;
        repositories?: Array<{ owner?: { login?: string; type?: string } }>;
      };
      repositoryCount = data.total_count ?? 0;
      accountLogin = data.repositories?.[0]?.owner?.login ?? null;
      accountType = data.repositories?.[0]?.owner?.type ?? null;
    }
  } catch (error) {
    console.warn('[ACIE] Could not read installation details:', (error as Error).message);
  }

  // Best-effort persistence; the app works without a database.
  try {
    await run(
      `CREATE TABLE IF NOT EXISTS installations (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         installation_id INTEGER NOT NULL UNIQUE,
         account_login TEXT,
         account_type TEXT,
         repository_count INTEGER DEFAULT 0,
         setup_action TEXT,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
       )`
    );
    await run(
      `INSERT INTO installations (installation_id, account_login, account_type, repository_count, setup_action)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(installation_id) DO UPDATE SET
         account_login = excluded.account_login,
         account_type = excluded.account_type,
         repository_count = excluded.repository_count,
         setup_action = excluded.setup_action,
         updated_at = CURRENT_TIMESTAMP`,
      [installationId, accountLogin, accountType, repositoryCount, setupAction]
    );
  } catch (error) {
    console.warn('[ACIE] Installation not persisted:', (error as Error).message);
  }

  destination.searchParams.set('setup', 'ok');
  destination.searchParams.set('installation_id', String(installationId));
  destination.searchParams.set('repos', String(repositoryCount));
  return NextResponse.redirect(destination.toString());
}
