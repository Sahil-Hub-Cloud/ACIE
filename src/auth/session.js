import { jwtVerify, SignJWT } from 'jose';
import cookie from 'cookie';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-insecure-secret-for-dev';
const secretKey = new TextEncoder().encode(SESSION_SECRET);

/**
 * Creates a signed JWT session token.
 * @param {string} userId The internal user ID (UUID)
 * @returns {Promise<string>}
 */
export async function createSession(userId) {
    const jwt = await new SignJWT({ sub: userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secretKey);
    return jwt;
}

/**
 * Extracts the user ID from the request cookies.
 * @param {import('http').IncomingMessage} req 
 * @returns {Promise<string|null>} The user ID if valid, null otherwise
 */
export async function getSession(req) {
    try {
        const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
        const token = cookies['acie_session'];
        if (!token) return null;

        const { payload } = await jwtVerify(token, secretKey);
        return payload.sub;
    } catch (error) {
        // Token is invalid or expired
        return null;
    }
}
