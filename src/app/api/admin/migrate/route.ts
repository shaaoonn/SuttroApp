import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Common Coolify/Supabase Docker hostnames to try
const DB_HOST_CANDIDATES = [
  'supabase-db',
  'db',
  'postgres',
  'postgresql',
  'supabasedb',
];

// Common Supabase default passwords
const DB_PASSWORD_CANDIDATES = [
  'your-super-secret-and-long-postgres-password',
  'postgres',
  'supabase',
];

async function tryConnect(connectionString: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Client } = require('pg');
  const client = new Client({ connectionString, ssl: false, connectionTimeoutMillis: 3000 });
  await client.connect();
  return client;
}

async function findDatabase(explicitUrl?: string) {
  // 1. Try explicit DATABASE_URL first
  if (explicitUrl) {
    try {
      const client = await tryConnect(explicitUrl);
      return { client, url: explicitUrl };
    } catch {
      // Fall through to auto-discovery
    }
  }

  // 2. Auto-discover: try common hostnames + passwords
  for (const host of DB_HOST_CANDIDATES) {
    for (const password of DB_PASSWORD_CANDIDATES) {
      for (const user of ['supabase_admin', 'postgres']) {
        const url = `postgresql://${user}:${encodeURIComponent(password)}@${host}:5432/postgres`;
        try {
          const client = await tryConnect(url);
          return { client, url: `${host}:5432 (user: ${user})` };
        } catch {
          // Try next
        }
      }
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  // Protect with service role key
  const authHeader = req.headers.get('authorization');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!authHeader || authHeader !== `Bearer ${serviceKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await findDatabase(process.env.DATABASE_URL);
  if (!result) {
    return NextResponse.json({
      error: 'Could not connect to database. Tried auto-discovery and DATABASE_URL.',
      tried: DB_HOST_CANDIDATES,
    }, { status: 500 });
  }

  const { client, url: connInfo } = result;

  try {
    // Read migration file
    let sql: string;
    try {
      sql = readFileSync(resolve(process.cwd(), 'supabase/migrations/002_features.sql'), 'utf-8');
    } catch {
      // If file not found (Docker), try reading from body
      try {
        const body = await req.json();
        sql = body.sql;
      } catch {
        sql = '';
      }
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
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && !s.startsWith('--'));

    const results: string[] = [];
    for (const stmt of statements) {
      try {
        await client.query(stmt);
        results.push(`OK: ${stmt.substring(0, 60)}...`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes('already exists') || msg.includes('duplicate key')) {
          results.push(`SKIP (exists): ${stmt.substring(0, 60)}...`);
        } else {
          results.push(`ERROR: ${msg} — ${stmt.substring(0, 80)}...`);
        }
      }
    }

    await client.end();
    return NextResponse.json({ success: true, connectedTo: connInfo, results });
  } catch (err: unknown) {
    await client.end().catch(() => {});
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Migration failed: ${msg}` }, { status: 500 });
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

  // Try auto-discover DB connection
  let dbDiscovery = 'not attempted';
  if (!hasDbUrl) {
    const result = await findDatabase();
    dbDiscovery = result ? `found: ${result.url}` : 'failed: no connection found';
    if (result) await result.client.end().catch(() => {});
  }

  return NextResponse.json({
    databaseUrlConfigured: hasDbUrl,
    dbDiscovery,
    tables: status,
    migrationNeeded: Object.values(status).some(v => !v),
  });
}
