'use client';

import { createBrowserClient } from '@supabase/ssr';

// ─────────────────────────────────────────────
// Browser Supabase client for auth & CRUD
// Uses @supabase/ssr so auth tokens are stored
// in cookies (readable by middleware & server).
// ─────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createBrowserClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY);
