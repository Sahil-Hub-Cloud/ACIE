import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
    console.warn('SUPABASE_URL is not defined in environment variables');
}

// Client for frontend/authenticated requests (respects RLS)
export const supabaseClient = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);

// Client for backend/webhook requests (bypasses RLS)
export const supabaseAdmin = createClient(
    supabaseUrl || '',
    supabaseServiceRoleKey || ''
);
