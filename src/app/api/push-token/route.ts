import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Push Token API - Save/update FCM token for push notifications
// POST: { fcm_token: string }
// ─────────────────────────────────────────────

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getUserId(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const sb = createClient(url, key);
  const { data } = await sb.auth.getUser(token);
  return data?.user?.id ?? null;
}

export async function POST(request: NextRequest) {
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const userId = await getUserId(token);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const { fcm_token } = await request.json();
    if (!fcm_token) {
      return NextResponse.json({ error: 'fcm_token required' }, { status: 400 });
    }

    // Upsert: update if exists, insert if not
    const { error } = await sb
      .from('push_tokens')
      .upsert(
        {
          user_id: userId,
          fcm_token,
          platform: 'android',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,fcm_token' }
      );

    if (error) {
      console.error('Push token save error:', error);
      return NextResponse.json({ error: 'failed to save token' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Push token API error:', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
