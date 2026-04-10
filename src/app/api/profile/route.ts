import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { syncAllProfiles, isSheetsConfigured } from '@/lib/google-sheets';

// ─────────────────────────────────────────────
// Profile API — GET & PATCH user profile
// Requires Authorization header
// Uses service-role key to bypass RLS for profile ops
// ─────────────────────────────────────────────

function getUser(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET(request: NextRequest) {
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const token = getUser(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Get profile from DB
  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If no profile exists (e.g. Google user where trigger didn't fire),
  // create one now
  if (!profile) {
    const meta = user.user_metadata || {};
    const newProfile = {
      id: user.id,
      phone: user.phone || null,
      name: meta.full_name || meta.name || null,
      class_level: 9,
      subscription_plan: 'free',
    };
    await sb.from('profiles').upsert(newProfile);

    // Background sync to Google Sheets (new user created)
    if (isSheetsConfigured()) {
      syncAllProfiles().catch(() => {});
    }

    return NextResponse.json({
      ...newProfile,
      email: user.email || null,
      avatar_url: meta.avatar_url || meta.picture || null,
      created_at: user.created_at,
    });
  }

  const meta = user.user_metadata || {};
  return NextResponse.json({
    ...profile,
    email: user.email || null,
    avatar_url: meta.avatar_url || meta.picture || null,
  });
}

export async function PATCH(request: NextRequest) {
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const token = getUser(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  // Only allow updating name and class_level
  if (body.name !== undefined) updates.name = body.name;
  if (body.class_level !== undefined) updates.class_level = Number(body.class_level);

  const { data, error } = await sb
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Background sync to Google Sheets (profile updated)
  if (isSheetsConfigured()) {
    syncAllProfiles().catch(() => {});
  }

  return NextResponse.json(data);
}
