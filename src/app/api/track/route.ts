import { NextResponse, type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 });
  }

  // Get authenticated user from Authorization header (main app uses localStorage, not cookies)
  let userId: string | null = null;
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const { data: { user } } = await sb.auth.getUser(token);
    userId = user?.id || null;
  }

  const body = await request.json();
  const { eventType, contentType, contentId, metadata } = body;

  if (!eventType || !contentType || !contentId) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const { error } = await sb.from('user_activity').insert({
    user_id: userId,
    event_type: eventType,
    content_type: contentType,
    content_id: contentId,
    metadata: metadata || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
