import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ─────────────────────────────────────────────
// Site Content API — GET all / PUT update
// Admin-only (uses service role key)
// ─────────────────────────────────────────────

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function GET() {
  const sb = getAdmin();
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const { data, error } = await sb
    .from('site_content')
    .select('*')
    .order('page')
    .order('sort_order');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data || []);
}

export async function PUT(request: NextRequest) {
  const sb = getAdmin();
  if (!sb) return NextResponse.json({ error: 'not configured' }, { status: 503 });

  const body = await request.json();
  const { page, key, value } = body;

  if (!page || !key || value === undefined) {
    return NextResponse.json({ error: 'page, key, value required' }, { status: 400 });
  }

  const { error } = await sb
    .from('site_content')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('page', page)
    .eq('key', key);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
