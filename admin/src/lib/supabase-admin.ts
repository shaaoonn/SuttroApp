import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Supabase Admin Client — uses SERVICE ROLE KEY
// This key bypasses RLS — only use server-side
//
// Lazy-initialized: avoids crash during Docker
// build when env vars are not yet available.
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = any;

let _client: SupabaseClient<AnyDB> | null = null;

export function getSupabaseAdmin(): SupabaseClient<AnyDB> {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    if (!url || !key) {
      throw new Error('Supabase admin not configured');
    }
    _client = createClient<AnyDB>(url, key, {
      global: {
        fetch: (fetchUrl: RequestInfo | URL, options?: RequestInit) => {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 5000);
          return fetch(fetchUrl, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(timeout));
        },
      },
    });
  }
  return _client;
}

// Backward-compatible lazy proxy — existing code using
// `supabaseAdmin.from(...)` keeps working without changes.
export const supabaseAdmin = new Proxy({} as SupabaseClient<AnyDB>, {
  get(_target, prop: string | symbol) {
    const client = getSupabaseAdmin();
    const value = (client as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function'
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
