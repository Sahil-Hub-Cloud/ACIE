import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { run, get } from '../../../../lib/db';
import type { User } from '../../../../lib/types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.warn('[ACIE] JWT_SECRET not set — auth will fail in production.');

const GITHUB_CLIENT_ID =
  process.env.GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const OAUTH_STATE_COOKIE = 'acie_oauth_state';

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie');
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return undefined;
}

function clearStateCookie(res: NextResponse) {
  res.cookies.set(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

function fail(message: string, status = 400) {
  const res = NextResponse.json({ message }, { status });
  clearStateCookie(res);
  return res;
}

export async function POST(req: Request) {
  try {
    const { code, state } = await req.json().catch(() => ({ code: undefined, state: undefined }));

    if (!code) {
      return fail('Missing authorization code from GitHub.');
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return fail(
        'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
        503
      );
    }

    if (!JWT_SECRET) {
      return fail('Server is missing JWT_SECRET. Sessions cannot be signed.', 503);
    }

    // Verify the CSRF state we issued when starting the OAuth flow.
    const expectedState = readCookie(req, OAUTH_STATE_COOKIE);
    if (!expectedState) {
      return fail('OAuth session expired or cookies are blocked. Please try signing in again.');
    }
    if (!state || state !== expectedState) {
      return fail('OAuth state mismatch — sign-in request could not be verified.');
    }

    // 1. Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      return fail(tokenData.error_description || 'GitHub rejected the authorization code.');
    }

    const accessToken = tokenData.access_token as string;

    // 2. Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const githubUser = await userResponse.json();

    if (!githubUser?.id) {
      return fail('Could not read your GitHub profile. Please try again.');
    }

    // 3. Upsert user in database (best-effort; DB may be unconfigured)
    let user: User | undefined;
    try {
      user = await get<User>('SELECT * FROM users WHERE github_id = ?', [githubUser.id]);

      if (!user) {
        await run(
          `INSERT INTO users (github_id, username, email, avatar_url, role)
           VALUES (?, ?, ?, ?, 'admin')`,
          [githubUser.id, githubUser.login, githubUser.email, githubUser.avatar_url]
        );
        user = await get<User>('SELECT * FROM users WHERE github_id = ?', [githubUser.id]);
      }
    } catch (dbError) {
      console.warn('[ACIE] User persistence skipped:', (dbError as Error).message);
    }

    // If the DB is unconfigured, fall back to the GitHub identity.
    if (!user) {
      user = {
        id: githubUser.id,
        githubId: githubUser.id,
        username: githubUser.login,
        email: githubUser.email,
        avatarUrl: githubUser.avatar_url,
        role: 'admin',
        createdAt: new Date().toISOString(),
      } as User;
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ token, user });
    clearStateCookie(response);
    return response;
  } catch (error) {
    console.error('GitHub Auth Error:', error);
    return fail('Internal server error during authentication', 500);
  }
}
