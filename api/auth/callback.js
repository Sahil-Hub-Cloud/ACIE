import axios from 'axios';
import { supabaseAdmin } from '../../src/db/supabase.js';
import { getSession, saveSession } from '../../src/auth/session.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { code, state } = req.query;
    if (!code || !state) return res.status(400).json({ error: 'Missing code or state parameter' });

    const session = await getSession(req, res);
    
    if (!session.oauthState || state !== session.oauthState) {
        return res.status(403).json({ error: 'Invalid state parameter - CSRF failed' });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    try {
        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            code
        }, {
            headers: { Accept: 'application/json' },
            timeout: 5000
        });
        const accessToken = tokenRes.data.access_token;
        if (!accessToken) return res.status(400).json({ error: 'Failed to retrieve access token' });

        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` },
            timeout: 5000
        });
        const githubUser = userRes.data;

        const emailsRes = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${accessToken}` },
            timeout: 5000
        });
        const primaryEmail = emailsRes.data.find(e => e.primary)?.email || emailsRes.data[0]?.email;

        const githubId = githubUser.id;
        const email = primaryEmail;
        const name = githubUser.name || githubUser.login;
        const avatarUrl = githubUser.avatar_url;
        const githubUsername = githubUser.login;

        const { data: user, error: upsertError } = await supabaseAdmin
            .from('users')
            .upsert(
                { github_id: githubId, email, name, avatar_url: avatarUrl, github_username: githubUsername },
                { onConflict: 'github_id' }
            )
            .select()
            .single();

        if (upsertError) throw upsertError;

        const { data: existingWorkspace } = await supabaseAdmin
            .from('workspaces')
            .select('id')
            .eq('owner_id', user.id)
            .limit(1)
            .single();

        if (!existingWorkspace) {
            const slug = `${githubUsername.toLowerCase()}-workspace-${Date.now().toString().slice(-4)}`;
            const { error: workspaceError } = await supabaseAdmin
                .from('workspaces')
                .insert({ owner_id: user.id, name: `${githubUsername}'s Workspace`, slug });
            
            if (workspaceError) throw workspaceError;
        }

        await supabaseAdmin.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);

        await saveSession(req, res, { userId: user.id, githubUsername });

        res.redirect(302, '/dashboard');
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}
