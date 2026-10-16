import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { get } from '../../../../lib/db';
import { readCookie, SESSION_COOKIE } from '../../../../lib/session';
import type { User } from '../../../../lib/types';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.warn('[ACIE] JWT_SECRET not set.');

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : undefined;
    // The session normally arrives as an httpOnly cookie; Bearer stays
    // supported for non-browser clients.
    const token = bearerToken ?? readCookie(req, SESSION_COOKIE);

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!JWT_SECRET) return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    const user = await get<User>('SELECT * FROM users WHERE id = ?', [decoded.userId]);

    if (!user) {
        // If DB is missing/mocked, just return the decoded info
        return NextResponse.json({
            id: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            avatarUrl: null
        });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}
