import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPushNotification } from '@/lib/firebase-admin';

// ─────────────────────────────────────────────
// Admin Send Notification API
// POST: { title, body, type?, path?, target? }
// type: "general" | "class" | "exam" | "daily"
// target: "all" | "class_9" | "class_10" | "<user_id>"
// ─────────────────────────────────────────────

// Admin user IDs who can send notifications
const ADMIN_IDS = [
  // Add admin user IDs here
];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const sb = createClient(url, key);
  const { data } = await sb.auth.getUser(token);
  return data?.user ?? null;
}

// Channel mapping for notification types
const CHANNEL_MAP: Record<string, string> = {
  general: 'suttro_general',
  class: 'suttro_new_class',
  exam: 'suttro_exam',
  daily: 'suttro_daily_lesson',
};

export async function POST(request: NextRequest) {
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  // Auth check
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const token = authHeader.slice(7);
  const user = await getUser(token);
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Admin check — if ADMIN_IDS is empty, check user metadata for admin role
  const isAdmin =
    ADMIN_IDS.length === 0
      ? user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin'
      : ADMIN_IDS.includes(user.id);

  if (!isAdmin) {
    return NextResponse.json({ error: 'forbidden — admin only' }, { status: 403 });
  }

  try {
    const { title, body, type = 'general', path = '/', target = 'all' } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'title and body required' }, { status: 400 });
    }

    // 1. Save notification to DB
    const { data: notification, error: saveErr } = await sb
      .from('notifications')
      .insert({ title, body, type, path, target, sent_by: user.id })
      .select('id')
      .single();

    if (saveErr) {
      console.error('Save notification error:', saveErr);
      return NextResponse.json({ error: 'failed to save notification' }, { status: 500 });
    }

    // 2. Get target FCM tokens
    let tokensQuery = sb.from('push_tokens').select('fcm_token');

    if (target === 'all') {
      // All tokens — no filter
    } else if (target === 'class_9' || target === 'class_10') {
      // Get user IDs for specific class from profiles
      const classNum = target === 'class_9' ? 9 : 10;
      const { data: classUsers } = await sb
        .from('profiles')
        .select('id')
        .eq('class', classNum);

      if (classUsers && classUsers.length > 0) {
        const userIds = classUsers.map((u: { id: string }) => u.id);
        tokensQuery = tokensQuery.in('user_id', userIds);
      } else {
        return NextResponse.json({
          success: true,
          notification_id: notification.id,
          sent: 0,
          failed: 0,
          message: 'No users found for target class',
        });
      }
    } else {
      // Specific user ID
      tokensQuery = tokensQuery.eq('user_id', target);
    }

    const { data: tokenRows, error: tokenErr } = await tokensQuery;
    if (tokenErr) {
      console.error('Token fetch error:', tokenErr);
      return NextResponse.json({ error: 'failed to fetch tokens' }, { status: 500 });
    }

    const fcmTokens = (tokenRows || []).map((t: { fcm_token: string }) => t.fcm_token);

    if (fcmTokens.length === 0) {
      return NextResponse.json({
        success: true,
        notification_id: notification.id,
        sent: 0,
        failed: 0,
        message: 'No FCM tokens found',
      });
    }

    // 3. Send push notifications (batch 500 at a time — FCM limit)
    let totalSuccess = 0;
    let totalFailure = 0;

    for (let i = 0; i < fcmTokens.length; i += 500) {
      const batch = fcmTokens.slice(i, i + 500);
      const result = await sendPushNotification(batch, title, body, {
        type,
        path,
        channel: CHANNEL_MAP[type] || 'suttro_general',
        notification_id: notification.id,
      });
      totalSuccess += result.success;
      totalFailure += result.failure;
    }

    return NextResponse.json({
      success: true,
      notification_id: notification.id,
      sent: totalSuccess,
      failed: totalFailure,
      total_tokens: fcmTokens.length,
    });
  } catch (e) {
    console.error('Send notification error:', e);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
