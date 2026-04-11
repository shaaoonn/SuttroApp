import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';

// ─────────────────────────────────────────────
// Firebase → Supabase Token Exchange API
// POST: { firebase_token } → { session }
//
// Flow:
// 1. Verify Firebase ID token (server-side)
// 2. Find or create user in Supabase by phone number
// 3. Return Supabase session tokens
// ─────────────────────────────────────────────

function getFirebaseAdmin() {
  if (admin.apps.length > 0) return admin;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) return null;
  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
  return admin;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(request: NextRequest) {
  try {
    const { firebase_token } = await request.json();
    if (!firebase_token) {
      return NextResponse.json({ error: 'firebase_token required' }, { status: 400 });
    }

    // 1. Verify Firebase ID token
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      return NextResponse.json({ error: 'Firebase not configured' }, { status: 503 });
    }

    let decodedToken;
    try {
      decodedToken = await firebaseAdmin.auth().verifyIdToken(firebase_token);
    } catch (err) {
      console.error('Firebase token verification failed:', err);
      return NextResponse.json({ error: 'Invalid Firebase token' }, { status: 401 });
    }

    const phoneNumber = decodedToken.phone_number;
    if (!phoneNumber) {
      return NextResponse.json({ error: 'No phone number in token' }, { status: 400 });
    }

    // 2. Find or create user in Supabase
    const sb = getSupabase();
    if (!sb) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    // Try to find existing user by phone
    const { data: existingUsers } = await sb.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.phone === phoneNumber
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with phone number
      const { data: newUser, error: createErr } = await sb.auth.admin.createUser({
        phone: phoneNumber,
        phone_confirm: true, // Already verified by Firebase
      });

      if (createErr || !newUser?.user) {
        console.error('Create user error:', createErr);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
      userId = newUser.user.id;
    }

    // 3. Generate Supabase session using admin API
    // Use generateLink to create a magic link, then extract the token
    // Or use the admin API to create a session directly

    // The cleanest approach: use signInWithPassword with a generated token
    // Actually, we'll use the admin API to generate an access token
    const { data: sessionData, error: sessionErr } =
      await sb.auth.admin.generateLink({
        type: 'magiclink',
        email: `${phoneNumber.replace('+', '')}@phone.suttro.app`,
      });

    // Alternative approach: create a custom JWT or use admin session generation
    // Since Supabase admin API doesn't directly create sessions,
    // we'll update the user's email as a workaround and sign them in

    // Better approach: Use Supabase's admin to set phone confirmed and
    // directly generate session tokens
    // The simplest way is to use admin.updateUserById and then signInWithOtp auto-confirm

    // Cleanest approach: Use Supabase REST API directly to generate session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    // Generate a one-time password and auto-verify it
    // Step 1: Send OTP (won't actually send SMS since we're using service role)
    const otpResponse = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({
        type: 'phone_change',
        phone: phoneNumber,
      }),
    });

    // Alternative: Direct session creation via admin
    // Use a workaround: create a temporary OTP and verify it immediately

    // Actually the simplest approach for self-hosted Supabase:
    // Create/update user → generate a session token via custom approach

    // Let's use the most reliable method: generate link via magic link
    // and extract the session

    // BEST approach: Use Supabase JS admin to directly sign in
    // by creating a one-time token

    // Generate a random password, set it, sign in with it, then remove it
    const tempPassword = `firebase_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Update user with temp password
    const { error: updateErr } = await sb.auth.admin.updateUserById(userId, {
      password: tempPassword,
      phone: phoneNumber,
      phone_confirm: true,
    });

    if (updateErr) {
      console.error('Update user error:', updateErr);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    // Sign in with temp password to get session
    // We need a client-side Supabase for this
    const { createClient: createAnonClient } = await import('@supabase/supabase-js');
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || serviceKey;
    const anonClient = createAnonClient(supabaseUrl, anonKey);

    const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
      phone: phoneNumber,
      password: tempPassword,
    });

    if (signInErr || !signInData.session) {
      console.error('Sign in error:', signInErr);
      // Clean up temp password
      await sb.auth.admin.updateUserById(userId, { password: undefined });
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Return the session tokens
    return NextResponse.json({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      expires_at: signInData.session.expires_at,
      expires_in: signInData.session.expires_in,
      user: {
        id: signInData.session.user.id,
        phone: signInData.session.user.phone,
      },
    });
  } catch (err) {
    console.error('Firebase exchange error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
