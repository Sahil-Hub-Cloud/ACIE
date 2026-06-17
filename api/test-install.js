import { getSession } from '../src/auth/session.js';
import { supabaseAdmin } from '../src/db/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getSession(req, res);
    if (!session || !session.userId) {
      return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
    }

    const { installation_id } = req.body;
    
    if (!installation_id) {
      return res.status(400).json({ error: 'installation_id is required in the request body.' });
    }

    // Find the user's workspace
    const { data: workspace, error: workspaceError } = await supabaseAdmin
      .from('workspaces')
      .select('id')
      .eq('owner_id', session.userId)
      .single();

    if (workspaceError || !workspace) {
      return res.status(404).json({ error: 'Workspace not found for this user.', details: workspaceError });
    }

    // Update the workspace with the new installation_id
    const { data, error } = await supabaseAdmin
      .from('workspaces')
      .update({ installation_id: parseInt(installation_id, 10) })
      .eq('id', workspace.id)
      .select();

    if (error) {
      return res.status(500).json({ error: 'Failed to update workspace.', details: error });
    }

    return res.status(200).json({ 
      success: true, 
      message: `Successfully linked installation_id ${installation_id} to workspace ${workspace.id}`, 
      data 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
}
