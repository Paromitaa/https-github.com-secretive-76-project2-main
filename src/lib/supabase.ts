import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

function createSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase env vars not found — auth features will be unavailable. ' +
        'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
    );
  }
  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: Boolean(supabaseUrl && supabaseAnonKey),
        detectSessionInUrl: Boolean(supabaseUrl && supabaseAnonKey),
      },
    }
  );
}

export const supabase = createSupabase();
