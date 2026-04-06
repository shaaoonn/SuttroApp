import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from './supabase-admin';

// ─────────────────────────────────────────────
// Server-side auth helpers for admin panel
// ─────────────────────────────────────────────

export async function getServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function getAdminUser() {
  const sb = await getServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  // Check admin_users table
  const { data: admin } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!admin) return null;
  return { ...user, role: admin.role as string, adminName: admin.name as string };
}
