import { getSession } from '../../src/auth/session.js';
import { supabaseAdmin } from '../../src/db/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getSession(req, res);
  if (!session.userId) {
    return res.redirect(302, '/api/auth/login');
  }

  const { installation_id } = req.query;
  if (!installation_id) {
    return res.redirect(302, '/dashboard');
  }

  // Find the user's workspace
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('id')
    .eq('owner_id', session.userId)
    .single();

  if (workspace) {
    // Update the workspace with the new installation_id
    await supabaseAdmin
      .from('workspaces')
      .update({ installation_id: parseInt(installation_id, 10) })
      .eq('id', workspace.id);
  }

  // Redirect to dashboard
  return res.redirect(302, '/dashboard');
}
