import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// ─────────────────────────────────────────────
// POST /api/seed
// Creates the initial super_admin account using
// env vars ADMIN_EMAIL and ADMIN_PASSWORD.
//
// Idempotent: if an admin already exists it will
// skip auth.users creation and just upsert the
// admin_users row.
//
// Protected by a shared secret (SUPABASE_SERVICE_ROLE_KEY)
// passed as Bearer token or ?key= query param.
// ─────────────────────────────────────────────

export async function POST(req: Request) {
  // ── Auth check ──
  const url = new URL(req.url);
  const keyParam = url.searchParams.get('key');
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.replace('Bearer ', '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey || (keyParam !== serviceKey && bearerToken !== serviceKey)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  // ── Read env vars ──
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    return NextResponse.json(
      { error: 'ADMIN_EMAIL and ADMIN_PASSWORD env vars are required' },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'ADMIN_PASSWORD must be at least 8 characters' },
      { status: 400 },
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // ── Step 1: Check if user already exists ──
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update password in case it changed
      const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
      });
      if (updateErr) {
        return NextResponse.json(
          { error: `Failed to update user: ${updateErr.message}` },
          { status: 500 },
        );
      }
    } else {
      // ── Step 2: Create auth user ──
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      });
      if (createErr) {
        return NextResponse.json(
          { error: `Failed to create user: ${createErr.message}` },
          { status: 500 },
        );
      }
      userId = newUser.user.id;
    }

    // ── Step 3: Upsert admin_users row ──
    const { error: upsertErr } = await supabase
      .from('admin_users')
      .upsert(
        { id: userId, email, role: 'super_admin', name },
        { onConflict: 'id' },
      );

    if (upsertErr) {
      return NextResponse.json(
        { error: `Failed to upsert admin_users: ${upsertErr.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: existingUser
        ? `Admin updated: ${email} (password reset)`
        : `Admin created: ${email}`,
      userId,
      role: 'super_admin',
    });
  } catch (err) {
    console.error('[seed]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Seed failed' },
      { status: 500 },
    );
  }
}

// GET — simple health check
export async function GET() {
  const hasEmail = !!process.env.ADMIN_EMAIL;
  const hasPassword = !!process.env.ADMIN_PASSWORD;
  return NextResponse.json({
    endpoint: '/api/seed',
    method: 'POST',
    envReady: hasEmail && hasPassword,
    ADMIN_EMAIL: hasEmail,
    ADMIN_PASSWORD: hasPassword,
  });
}
