import { createClient } from '@supabase/supabase-js';

export function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    console.error('Supabase env not loaded', { url, anon });
    throw new Error('Missing supabase env vars');
  }

  return createClient(url, anon);
}

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const admin = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !admin) {
    console.error('Supabase admin env not loaded', { url, admin });
    throw new Error('Missing supabase admin vars');
  }

  return createClient(url, admin);
}
