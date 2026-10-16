import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE = 'acie_session';

function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  return atob(padded);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * HS256 verification with Web Crypto — jsonwebtoken is Node-only and this
 * runs in the Edge runtime. Fails closed on any malformed input.
 */
export async function isValidSession(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [headerPart, payloadPart, signaturePart] = parts;

  let header: { alg?: string };
  try {
    header = JSON.parse(base64UrlDecode(headerPart));
  } catch {
    return false;
  }
  if (header.alg !== 'HS256') return false;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(`${headerPart}.${payloadPart}`)
    );
    const expected = bytesToBase64Url(new Uint8Array(signature));

    // Length check first, then a constant-time-style compare.
    if (expected.length !== signaturePart.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signaturePart.charCodeAt(i);
    }
    if (diff !== 0) return false;

    const payload = JSON.parse(base64UrlDecode(payloadPart)) as { exp?: number };
    if (typeof payload.exp !== 'number' || payload.exp * 1000 < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (!(await isValidSession(token, secret))) {
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/repos/:path*', '/analysis/:path*', '/graph/:path*', '/settings/:path*'],
};
