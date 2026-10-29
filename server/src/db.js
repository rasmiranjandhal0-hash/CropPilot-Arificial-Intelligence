import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
  console.warn('⚠️ Supabase client initialized without credentials. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
}

export const supabase = createClient(
  config.supabaseUrl || 'https://placeholder.supabase.co',
  config.supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
