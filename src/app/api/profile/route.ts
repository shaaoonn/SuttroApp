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

  // Allow updating name, class_level, phone, department
  if (body.name !== undefined) updates.name = body.name;
  if (body.class_level !== undefined) updates.class_level = Number(body.class_level);
  if (body.phone !== undefined) updates.phone = body.phone || null;
  if (body.department !== undefined) {
    const dept = String(body.department).toLowerCase();
    if (['science', 'humanities', 'commerce'].includes(dept)) {
      updates.department = dept;
    } else if (body.department === null || body.department === '') {
      updates.department = null;
    }
  }

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

// ─────────────────────────────────────────────
// DELETE /api/profile — Permanent account deletion
// Google Play Policy 2024 requires in-app account deletion
// Deletes: profile row, all user data (cascades via FK), auth user
// ─────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const token = getUser(request);
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data: { user } } = await sb.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const userId = user.id;

  try {
    // 1. Delete profile row (cascades to exam_results, daily_lesson_progress, push_tokens, etc. via FK)
    const { error: profileError } = await sb
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('[DELETE /profile] profile delete error:', profileError);
    }

    // 2. Delete the auth user itself (this fully removes them — they can't log back in)
    const { error: authError } = await sb.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('[DELETE /profile] auth delete error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // 3. Background sync (remove from Google Sheets)
    if (isSheetsConfigured()) {
      syncAllProfiles().catch(() => {});
    }

    return NextResponse.json({ success: true, deleted: userId });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[DELETE /profile] fatal:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
