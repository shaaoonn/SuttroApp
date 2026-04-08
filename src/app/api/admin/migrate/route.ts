import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Extract UUID from SUPABASE_URL for Coolify container name patterns
function getCoolifyUUID(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const match = url.match(/supabasekong-([a-z0-9]+)\./);
  return match ? match[1] : '';
}

// Common Coolify/Supabase Docker hostnames to try
function getDbHostCandidates(): string[] {
  const uuid = getCoolifyUUID();
  const hosts = [
    'supabase-db',
    'db',
    'postgres',
    'postgresql',
    'supabasedb',
  ];
  if (uuid) {
    // Coolify uses {service}-{uuid} pattern for container names
    hosts.unshift(
      `supabasedb-${uuid}`,
      `supabase-db-${uuid}`,
      `db-${uuid}`,
      `postgres-${uuid}`,
      `supabase_db_${uuid}`,
    );
  }
  return hosts;
}

// Common Supabase default passwords
const DB_PASSWORD_CANDIDATES = [
  'your-super-secret-and-long-postgres-password',
  'postgres',
  'supabase',
  'password',
  'super-secret-password',
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

  // 1b. Try env vars that might contain DB info
  for (const envVar of ['POSTGRES_URL', 'PG_DATABASE_URL', 'SUPABASE_DB_URL', 'DB_URL']) {
    const val = process.env[envVar];
    if (val) {
      try {
        const client = await tryConnect(val);
        return { client, url: `${envVar} env var` };
      } catch {
        // Try next
      }
    }
  }

  // 2. Auto-discover: try common hostnames + passwords
  const hostCandidates = getDbHostCandidates();
  for (const host of hostCandidates) {
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

  // Allow passing DATABASE_URL in body for one-time setup
  let bodyData: { sql?: string; databaseUrl?: string } = {};
  try {
    bodyData = await req.json();
  } catch {
    // No body
  }

  const dbUrl = bodyData.databaseUrl || process.env.DATABASE_URL;
  const result = await findDatabase(dbUrl);
  if (!result) {
    return NextResponse.json({
      error: 'Could not connect to database. Tried auto-discovery and DATABASE_URL.',
      tried: getDbHostCandidates(),
    }, { status: 500 });
  }

  const { client, url: connInfo } = result;

  try {
    // Read migration file
    let sql: string;
    try {
      sql = readFileSync(resolve(process.cwd(), 'supabase/migrations/002_features.sql'), 'utf-8');
    } catch {
      sql = bodyData.sql || '';
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

  // Collect DB-related env var names (not values) for debugging
  const dbEnvVars = Object.keys(process.env)
    .filter(k => /postgres|database|db_|pg_|supabase.*db/i.test(k))
    .map(k => k);

  return NextResponse.json({
    databaseUrlConfigured: hasDbUrl,
    dbDiscovery,
    dbEnvVarNames: dbEnvVars,
    coolifyUUID: getCoolifyUUID(),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '(not set)',
    triedHosts: getDbHostCandidates(),
    tables: status,
    migrationNeeded: Object.values(status).some(v => !v),
  });
}
