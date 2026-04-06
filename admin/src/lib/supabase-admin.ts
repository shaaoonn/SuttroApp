import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Supabase Admin Client — uses SERVICE ROLE KEY
// This key bypasses RLS — only use server-side
// ─────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin = createClient<any>(SUPABASE_URL, SUPABASE_SERVICE_KEY);
