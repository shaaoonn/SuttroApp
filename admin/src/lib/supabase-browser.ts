'use client';

import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Browser Supabase client for auth (login page)
// Uses anon key — no service role on client side
// ─────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY);
