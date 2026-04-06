import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Supabase server client for Server Components & API routes
// Uses anon key — RLS handles access control
//
// Note: We use a generic Database type to avoid
// `never` types on query results. When generated
// DB types are available, replace `any` with them.
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = any;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let client: SupabaseClient<AnyDB> | null = null;

export function getSupabase(): SupabaseClient<AnyDB> | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!client) {
    client = createClient<AnyDB>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
