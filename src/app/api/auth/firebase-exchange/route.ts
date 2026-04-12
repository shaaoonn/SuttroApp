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
// 3. Sign in via email+password (pseudo-email from phone)
// 4. Return Supabase session tokens
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

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Convert phone number to a pseudo-email for Supabase auth */
function phoneToEmail(phone: string): string {
  // +8801712345678 → 8801712345678@phone.suttro.app
  return `${phone.replace(/\+/g, '')}@phone.suttro.app`;
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
      console.error('Firebase Admin not configured — missing env vars');
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

    // 2. Get Supabase admin client
    const sb = getSupabaseAdmin();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!sb || !supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }

    const pseudoEmail = phoneToEmail(phoneNumber);
    const tempPassword = `fb_${Date.now()}_${crypto.randomUUID()}`;

    // 3. Find existing user by phone OR pseudo-email
    let userId: string | null = null;

    // Try by phone first
    const { data: allUsers } = await sb.auth.admin.listUsers({ perPage: 1000 });
    const existingUser = allUsers?.users?.find(
      (u) => u.phone === phoneNumber || u.email === pseudoEmail
    );

    if (existingUser) {
      userId = existingUser.id;

      // Update user: set pseudo-email, phone confirmed, temp password
      const { error: updateErr } = await sb.auth.admin.updateUserById(userId, {
        email: pseudoEmail,
        phone: phoneNumber,
        phone_confirm: true,
        email_confirm: true,
        password: tempPassword,
      });

      if (updateErr) {
        console.error('Update user error:', updateErr);
        return NextResponse.json({ error: 'ইউজার আপডেট করতে সমস্যা' }, { status: 500 });
      }
    } else {
      // Create new user
      const { data: newUser, error: createErr } = await sb.auth.admin.createUser({
        email: pseudoEmail,
        phone: phoneNumber,
        phone_confirm: true,
        email_confirm: true,
        password: tempPassword,
      });

      if (createErr || !newUser?.user) {
        console.error('Create user error:', createErr);
        return NextResponse.json({ error: 'ইউজার তৈরি করতে সমস্যা' }, { status: 500 });
      }
      userId = newUser.user.id;
    }

    // 4. Sign in with pseudo-email + temp password to get session
    const anonClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: pseudoEmail,
      password: tempPassword,
    });

    // 5. Clean up temp password immediately (set random unguessable one)
    await sb.auth.admin.updateUserById(userId, {
      password: crypto.randomUUID() + crypto.randomUUID(),
    });

    if (signInErr || !signInData.session) {
      console.error('Sign in error:', signInErr);
      return NextResponse.json({ error: 'সেশন তৈরি করতে সমস্যা' }, { status: 500 });
    }

    // 6. Return session tokens
    return NextResponse.json({
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      expires_at: signInData.session.expires_at,
      expires_in: signInData.session.expires_in,
      user: {
        id: signInData.session.user.id,
        phone: signInData.session.user.phone,
        email: signInData.session.user.email,
      },
    });
  } catch (err) {
    console.error('Firebase exchange error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
