import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Notifications API — List & mark read
// GET: list notifications for current user
// POST: mark a notification as read { notification_id }
// ─────────────────────────────────────────────

function getSupabase() {
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

export async function GET(request: NextRequest) {
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const userId = await getUserId(authHeader.slice(7));
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Get user's class for filtering
  const { data: profile } = await sb
    .from('profiles')
    .select('class')
    .eq('id', userId)
    .single();

  const userClass = profile?.class;

  // Fetch notifications targeted to this user
  let query = sb
    .from('notifications')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(50);

  // Filter: all, user's class, or direct user target
  if (userClass) {
    query = query.or(`target.eq.all,target.eq.class_${userClass},target.eq.${userId}`);
  } else {
    query = query.or(`target.eq.all,target.eq.${userId}`);
  }

  const { data: notifications, error } = await query;
  if (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json({ error: 'fetch failed' }, { status: 500 });
  }

  // Get read status for this user
  const notifIds = (notifications || []).map((n: { id: string }) => n.id);
  const { data: reads } = await sb
    .from('notification_reads')
    .select('notification_id')
    .eq('user_id', userId)
    .in('notification_id', notifIds);

  const readSet = new Set((reads || []).map((r: { notification_id: string }) => r.notification_id));

  const result = (notifications || []).map((n: Record<string, unknown>) => ({
    ...n,
    is_read: readSet.has(n.id as string),
  }));

  return NextResponse.json({ notifications: result });
}

export async function POST(request: NextRequest) {
  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const userId = await getUserId(authHeader.slice(7));
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
    const { notification_id } = await request.json();
    if (!notification_id) {
      return NextResponse.json({ error: 'notification_id required' }, { status: 400 });
    }

    // Mark as read
    const { error: insertErr } = await sb
      .from('notification_reads')
      .upsert(
        { notification_id, user_id: userId, read_at: new Date().toISOString() },
        { onConflict: 'notification_id,user_id' }
      );

    if (insertErr) {
      console.error('Mark read error:', insertErr);
      return NextResponse.json({ error: 'failed' }, { status: 500 });
    }

    // Increment read_count on notification
    await sb.rpc('increment_read_count', { notif_id: notification_id }).catch(() => {
      // Fallback: manually update
      sb.from('notifications')
        .update({ read_count: sb.rpc ? undefined : 0 })
        .eq('id', notification_id);
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
