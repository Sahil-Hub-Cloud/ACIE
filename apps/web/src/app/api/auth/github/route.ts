import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { run, get } from '../../../../lib/db';
import type { User } from '../../../../lib/types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ message: 'Code is required' }, { status: 400 });
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        // If secrets are missing, mock the login for demo purposes
        console.warn("GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing. Returning mock auth for demo.");
        const mockUser: User = {
            id: 1,
            githubId: 12345,
            username: 'Demo User',
            email: 'demo@example.com',
            avatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        const token = jwt.sign({ userId: mockUser.id, username: mockUser.username, role: mockUser.role }, JWT_SECRET, { expiresIn: '7d' });
        return NextResponse.json({ token, user: mockUser });
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
      return NextResponse.json({ message: tokenData.error_description }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // 2. Fetch user profile from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = await userResponse.json();

    // 3. Upsert user in database
    let user = await get<User>('SELECT * FROM users WHERE github_id = ?', [githubUser.id]);
    
    if (!user) {
      await run(`
        INSERT INTO users (github_id, username, email, avatar_url, role)
        VALUES (?, ?, ?, ?, 'admin')
      `, [githubUser.id, githubUser.login, githubUser.email, githubUser.avatar_url]);
      
      user = await get<User>('SELECT * FROM users WHERE github_id = ?', [githubUser.id]);
    }

    // If DB is missing/mocked, we create a fallback user
    if(!user) {
        user = {
            id: Math.floor(Math.random() * 10000),
            githubId: githubUser.id,
            username: githubUser.login,
            email: githubUser.email,
            avatarUrl: githubUser.avatar_url,
            role: 'admin',
            createdAt: new Date().toISOString()
        };
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ token, user });
  } catch (error) {
    console.error('GitHub Auth Error:', error);
    return NextResponse.json({ message: 'Internal server error during authentication' }, { status: 500 });
  }
}
