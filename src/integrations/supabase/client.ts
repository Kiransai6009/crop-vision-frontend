import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation log (for debug mode, can be silenced in production)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("CRITICAL AUTH ERROR: Environment variables are missing or incorrectly configured in .env");
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "", {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});