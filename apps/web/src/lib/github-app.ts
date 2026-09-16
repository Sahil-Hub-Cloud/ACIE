/**
 * GitHub App authentication.
 *
 * A GitHub App authenticates two different ways:
 *   1. As the app itself, with a short-lived RS256 JWT signed by its private key.
 *   2. As an installation, by exchanging that JWT for an installation access
 *      token that is scoped to the repos the app was installed on.
 *
 * Installation tokens are cached per installation until shortly before they
 * expire, so a burst of webhooks only mints one token.
 */

import jwt from 'jsonwebtoken';

const GITHUB_API = 'https://api.github.com';
const API_VERSION = '2022-11-28';

export function getAppId(): string | undefined {
  return process.env.GITHUB_APP_ID || process.env.APP_ID || undefined;
}

/**
 * Private keys arrive in several shapes depending on how they were stored:
 * raw PEM, PEM with literal `\n` escapes, or a base64 blob. Normalise all three.
 */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim().replace(/^["']|["']$/g, '');

  if (!key.includes('-----BEGIN')) {
    try {
      const decoded = Buffer.from(key, 'base64').toString('utf8');
      if (decoded.includes('-----BEGIN')) key = decoded;
    } catch {
      /* not base64 — fall through and let the signer report the problem */
    }
  }

  if (key.includes('\\n')) key = key.replace(/\\n/g, '\n');

  return key.trim();
}

export function getPrivateKey(): string | undefined {
  const raw = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!raw) return undefined;
  return normalizePrivateKey(raw);
}

export function isGitHubAppConfigured(): boolean {
  return Boolean(getAppId() && getPrivateKey());
}

/** True when we have any credential that can read repos. */
export function hasRepoCredentials(): boolean {
  return Boolean(process.env.GITHUB_TOKEN) || isGitHubAppConfigured();
}

/** A JWT proving we are the GitHub App itself. Max lifetime is 10 minutes. */
export function createAppJwt(): string {
  const appId = getAppId();
  const privateKey = getPrivateKey();
  if (!appId || !privateKey) {
    throw new Error('GitHub App credentials are not configured (GITHUB_APP_ID / GITHUB_APP_PRIVATE_KEY)');
  }

  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { iat: now - 60, exp: now + 540, iss: appId },
    privateKey,
    { algorithm: 'RS256' }
  );
}

// ── Installation tokens ─────────────────────────────────────────────────────

interface CachedToken {
  token: string;
  expiresAt: number;
}

const installationTokenCache = new Map<number, CachedToken>();
const globalCache = globalThis as typeof globalThis & {
  __acieInstallationTokens?: Map<number, CachedToken>;
};
// Survive module reloads within the same serverless instance.
const tokenCache = globalCache.__acieInstallationTokens ?? installationTokenCache;
globalCache.__acieInstallationTokens = tokenCache;

export async function getInstallationToken(installationId: number): Promise<string> {
  const cached = tokenCache.get(installationId);
  // Refresh a minute early so an in-flight request never uses a dead token.
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const response = await fetch(
    `${GITHUB_API}/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${createAppJwt()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': API_VERSION,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to mint installation token for ${installationId} (${response.status}): ${await response.text()}`
    );
  }

  const data = (await response.json()) as { token: string; expires_at: string };
  tokenCache.set(installationId, {
    token: data.token,
    expiresAt: new Date(data.expires_at).getTime(),
  });
  return data.token;
}

/** Which installation has access to this repo? Null when the app isn't installed. */
export async function getRepoInstallationId(
  owner: string,
  repo: string
): Promise<number | null> {
  if (!isGitHubAppConfigured()) return null;

  const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/installation`, {
    headers: {
      Authorization: `Bearer ${createAppJwt()}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': API_VERSION,
    },
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { id?: number };
  return data.id ?? null;
}

/**
 * Pick the best credential for reading a repo:
 * known installation -> the app's installation for that repo -> PAT fallback.
 */
export async function resolveRepoToken(
  owner: string,
  repo: string,
  installationId?: number | null
): Promise<string | null> {
  if (isGitHubAppConfigured()) {
    try {
      const id = installationId ?? (await getRepoInstallationId(owner, repo));
      if (id) return await getInstallationToken(id);
    } catch (error) {
      console.warn('[ACIE] Falling back to GITHUB_TOKEN:', (error as Error).message);
    }
  }
  return process.env.GITHUB_TOKEN || null;
}

// ── App metadata ────────────────────────────────────────────────────────────

let cachedSlug: string | null | undefined;

/** The app's public slug, used to build https://github.com/apps/<slug>/... URLs. */
export async function getAppSlug(): Promise<string | null> {
  if (process.env.GITHUB_APP_SLUG) return process.env.GITHUB_APP_SLUG;
  if (cachedSlug !== undefined) return cachedSlug;
  if (!isGitHubAppConfigured()) return (cachedSlug = null);

  try {
    const response = await fetch(`${GITHUB_API}/app`, {
      headers: {
        Authorization: `Bearer ${createAppJwt()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': API_VERSION,
      },
    });
    if (!response.ok) return (cachedSlug = null);
    const data = (await response.json()) as { slug?: string };
    cachedSlug = data.slug ?? null;
  } catch {
    cachedSlug = null;
  }
  return cachedSlug;
}

// ── Fetch helper ────────────────────────────────────────────────────────────

export async function githubFetch<T = any>(
  path: string,
  init: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/vnd.github+json');
  headers.set('X-GitHub-Api-Version', API_VERSION);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(path.startsWith('http') ? path : `${GITHUB_API}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API ${response.status} ${init.method ?? 'GET'} ${path}: ${await response.text()}`
    );
  }

  return (await response.json()) as T;
}
