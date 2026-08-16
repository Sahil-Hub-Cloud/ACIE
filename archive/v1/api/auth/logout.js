import { getSession } from '../../src/auth/session.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const session = await getSession(req, res);
    session.destroy();
    
    res.redirect(302, '/');
}
