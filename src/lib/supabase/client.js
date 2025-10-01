import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'supabase.auth.token',
      cookieOptions: {
        domain: window.location.hostname,
        path: '/',
        sameSite: 'lax',
        secure: true,
      },
    },
  });
} else {
  console.error("Supabase URL or Anon Key is missing. Please check your .env file.");
}

export { supabase };