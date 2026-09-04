import { createClient } from '@supabase/supabase-js';

// Authoritative Supabase Production Project Configuration
// Built-in defaults guarantee database connectivity on production deployments
// even if environment variables are omitted in the hosting platform.
const DEFAULT_SUPABASE_URL = 'https://iecesxahkbkkafzmzwcd.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_ZbNWt0YhZOgiSA9ZuOOblg__LJz7o_s';

const supabaseUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  DEFAULT_SUPABASE_URL;

const supabaseAnonKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
