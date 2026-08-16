import crypto from 'node:crypto';
import { saveSession } from '../../src/auth/session.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        return res.status(500).json({ error: 'Missing GITHUB_CLIENT_ID' });
    }

    const oauthState = crypto.randomBytes(16).toString('hex');
    
    await saveSession(req, res, { oauthState });

    const scope = 'read:user,user:email';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${oauthState}`;
    
    res.redirect(302, githubAuthUrl);
}
