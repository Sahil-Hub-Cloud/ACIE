import { describe, it, expect } from 'vitest';
import jwt from 'jsonwebtoken';
import { isValidSession } from '../middleware';

const SECRET = 'middleware-test-secret';
const payload = { userId: 1, username: 'octocat', role: 'developer' };

// The login route signs with jsonwebtoken; the middleware verifies with Web
// Crypto. These tests pin the interop — a mismatch would bounce every signed-in
// user back to /login in production while unit tests still looked green.
describe('middleware session verification', () => {
  it('accepts a token signed by jsonwebtoken (login route interop)', async () => {
    const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });
    expect(await isValidSession(token, SECRET)).toBe(true);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = jwt.sign(payload, 'other-secret', { expiresIn: '7d' });
    expect(await isValidSession(token, SECRET)).toBe(false);
  });

  it('rejects a tampered payload', async () => {
    const token = jwt.sign(payload, SECRET, { expiresIn: '7d' });
    const [header, , signature] = token.split('.');
    const forged = { ...payload, userId: 999 };
    const forgedPayload = Buffer.from(JSON.stringify(forged)).toString('base64url');
    expect(await isValidSession(`${header}.${forgedPayload}.${signature}`, SECRET)).toBe(
      false
    );
  });

  it('rejects an expired token', async () => {
    const token = jwt.sign(payload, SECRET, { expiresIn: '-10s' });
    expect(await isValidSession(token, SECRET)).toBe(false);
  });

  it('rejects an alg:none token', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString(
      'base64url'
    );
    const body = Buffer.from(JSON.stringify({ ...payload, exp: 9999999999 })).toString(
      'base64url'
    );
    expect(await isValidSession(`${header}.${body}.`, SECRET)).toBe(false);
  });

  it('rejects garbage input instead of throwing', async () => {
    expect(await isValidSession('', SECRET)).toBe(false);
    expect(await isValidSession('not.a.jwt', SECRET)).toBe(false);
    expect(await isValidSession('a.b', SECRET)).toBe(false);
  });
});
