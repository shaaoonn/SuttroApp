import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export async function POST(req: NextRequest) {
  // Protect with service role key
  const authHeader = req.headers.get('authorization');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return NextResponse.json(
      { error: 'DATABASE_URL not configured. Add it to your environment variables.' },
      { status: 500 }
    );
  }

  try {
    // Dynamic import pg to avoid build issues if not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Client } = require('pg');

    const client = new Client({ connectionString: dbUrl, ssl: false });
    await client.connect();

    // Read migration file
    let sql: string;
    try {
      sql = readFileSync(resolve(process.cwd(), 'supabase/migrations/002_features.sql'), 'utf-8');
    } catch {
      // If file not found (Docker), use inline SQL
      sql = (await req.json()).sql;
      if (!sql) {
        await client.end();
        return NextResponse.json(
          { error: 'Migration file not found and no SQL provided in body' },
          { status: 400 }
        );
      }
    }

    // Split and execute statements
    const statements = sql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    const results: string[] = [];
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        results.push(`OK: ${stmt.substring(0, 60)}...`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // Skip "already exists" errors
        if (msg.includes('already exists') || msg.includes('duplicate key')) {
          results.push(`SKIP (exists): ${stmt.substring(0, 60)}...`);
        } else {
          results.push(`ERROR: ${msg} — ${stmt.substring(0, 80)}...`);
        }
      }
    }

    await client.end();
    return NextResponse.json({ success: true, results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `DB connection failed: ${msg}` }, { status: 500 });
  }
}

// GET shows migration status
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasDbUrl = !!process.env.DATABASE_URL;

  // Check which tables exist via Supabase REST
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const tables = ['user_stats', 'badges', 'srs_cards', 'subscription_plans', 'payments',
                  'user_chapter_progress', 'xp_transactions', 'daily_challenges'];

  const status: Record<string, boolean> = {};
  for (const table of tables) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count&limit=0`, {
        headers: {
          apikey: serviceKey!,
          Authorization: `Bearer ${serviceKey}`,
          Prefer: 'count=exact',
        },
      });
      status[table] = res.status === 200;
    } catch {
      status[table] = false;
    }
  }

  return NextResponse.json({
    databaseUrlConfigured: hasDbUrl,
    tables: status,
    migrationNeeded: Object.values(status).some(v => !v),
  });
}
