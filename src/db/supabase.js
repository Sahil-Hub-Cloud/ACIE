import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Strict validation to prevent PGRST125 errors
if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}
if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

// Remove any trailing slashes from the URL to prevent PGRST125 errors
const cleanUrl = supabaseUrl.replace(/\/$/, '');

export const supabaseAdmin = createClient(cleanUrl, supabaseServiceRoleKey);
