export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        console.error('GITHUB_CLIENT_ID is missing');
        return res.status(500).json({ error: 'Server misconfiguration' });
    }

    // Redirect to GitHub OAuth
    const scope = 'read:user,user:email';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}`;
    
    res.redirect(302, githubAuthUrl);
}
