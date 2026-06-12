import axios from 'axios';
import { supabaseAdmin } from '../../src/db/supabase.js';
import { createSession } from '../../src/auth/session.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'No code provided' });

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    try {
        // 1. Exchange code for access token
        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: clientId,
            client_secret: clientSecret,
            code
        }, {
            headers: { Accept: 'application/json' }
        });
        const accessToken = tokenRes.data.access_token;
        if (!accessToken) return res.status(400).json({ error: 'Failed to retrieve access token' });

        // 2. Fetch GitHub profile
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });
        const githubUser = userRes.data;

        // Fetch emails to get the primary one
        const emailsRes = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${accessToken}` }
        });
        const primaryEmail = emailsRes.data.find(e => e.primary)?.email || emailsRes.data[0]?.email;

        const githubId = String(githubUser.id);
        const email = primaryEmail;
        const name = githubUser.name || githubUser.login;
        const avatarUrl = githubUser.avatar_url;

        // 3. Check if user exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('github_id', githubId)
            .single();

        let userId;

        if (existingUser) {
            // Update existing user
            const { data: updatedUser, error: updateError } = await supabaseAdmin
                .from('users')
                .update({ email, name, avatar_url: avatarUrl })
                .eq('id', existingUser.id)
                .select()
                .single();
            if (updateError) throw updateError;
            userId = updatedUser.id;
        } else {
            // 4. Create new user, workspace, and settings
            const { data: newUser, error: insertError } = await supabaseAdmin
                .from('users')
                .insert({ github_id: githubId, email, name, avatar_url: avatarUrl })
                .select()
                .single();
            if (insertError) throw insertError;
            userId = newUser.id;

            const { data: newWorkspace, error: workspaceError } = await supabaseAdmin
                .from('workspaces')
                .insert({ owner_id: userId, name: `${name}'s Workspace` })
                .select()
                .single();
            if (workspaceError) throw workspaceError;

            const { error: settingsError } = await supabaseAdmin
                .from('settings')
                .insert({ workspace_id: newWorkspace.id });
            if (settingsError) throw settingsError;
        }

        // 5. Generate session cookie
        const token = await createSession(userId);
        res.setHeader('Set-Cookie', `acie_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=604800`);

        // 6. Redirect to dashboard
        res.redirect(302, '/dashboard');
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
}
