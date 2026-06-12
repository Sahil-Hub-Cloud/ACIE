import crypto from 'node:crypto';
import { getSession } from '../../src/auth/session.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        return res.status(500).json({ error: 'Missing GITHUB_CLIENT_ID' });
    }

    const state = crypto.randomBytes(16).toString('hex');
    
    const session = await getSession(req, res);
    session.oauthState = state;
    await session.save();

    const scope = 'read:user,user:email';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${state}`;
    
    res.redirect(302, githubAuthUrl);
}
