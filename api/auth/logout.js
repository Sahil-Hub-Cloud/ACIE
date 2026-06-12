export default function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Clear the session cookie
    res.setHeader('Set-Cookie', 'acie_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    
    // Redirect to home/landing page
    res.redirect(302, '/');
}
