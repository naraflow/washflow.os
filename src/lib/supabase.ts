import { createClient } from '@supabase/supabase-js';

// Support both browser (import.meta.env) and Node.js (process.env) contexts
function getEnvVar(key: string): string | undefined {
  // Check Node.js context first (for Vite plugins/server-side)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  // Fall back to Vite's import.meta.env (browser context)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  return undefined;
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

