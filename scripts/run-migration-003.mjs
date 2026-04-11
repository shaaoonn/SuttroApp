/**
 * Run migration 003_dynamic_plans via Supabase REST API
 * Since PostgREST doesn't support DDL, we:
 * 1. Create a temp RPC function to run SQL
 * 2. Run the migration
 * 3. Drop the temp function
 */

const SUPABASE_URL = 'https://api.suttro.app';
const SERVICE_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NTQ2NDY4MCwiZXhwIjo0OTMxMTM4MjgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.B5_VLO2pONHEh83FOn1LtNLAlzrz09R16SMRDBsAzeQ';

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function rpc(fnName, params = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`RPC ${fnName} failed (${res.status}): ${text}`);
  return text;
}

async function restPatch(table, match, data) {
  const params = new URLSearchParams(match);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    method: 'PATCH',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PATCH ${table} failed (${res.status}): ${text}`);
  }
}

async function checkColumns() {
  // Try to select the new columns — if they don't exist, it'll error
  const res = await fetch(`${SUPABASE_URL}/rest/v1/subscription_plans?select=id,display_features,badge_text,highlight,cta_text,period_text,sort_order&limit=1`, {
    headers,
  });
  return res.ok;
}

async function main() {
  console.log('🔍 Checking if migration already applied...');

  const alreadyDone = await checkColumns();
  if (alreadyDone) {
    console.log('✅ Columns already exist! Checking if data populated...');

    // Check if data is populated
    const res = await fetch(`${SUPABASE_URL}/rest/v1/subscription_plans?select=id,display_features,sort_order`, { headers });
    const plans = await res.json();

    const needsData = plans.some(p => !p.display_features || p.display_features.length === 0);

    if (!needsData) {
      console.log('✅ Migration already fully applied. Nothing to do.');
      return;
    }

    console.log('📝 Columns exist but data needs populating...');
  } else {
    console.log('⚠️  New columns not found. DDL (ALTER TABLE) must be run manually.');
    console.log('');
    console.log('Run this SQL in Supabase SQL Editor:');
    console.log('─'.repeat(50));
    console.log(`
ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS display_features JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS badge_text       TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS highlight        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS cta_text         TEXT DEFAULT 'বিকাশে পে করো',
  ADD COLUMN IF NOT EXISTS period_text      TEXT DEFAULT '/মাস',
  ADD COLUMN IF NOT EXISTS sort_order       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ DEFAULT now();
    `);
    console.log('─'.repeat(50));
    console.log('After running DDL, re-run this script to populate data.');
    console.log('');
    console.log('🔄 Attempting to populate data via REST API anyway...');
  }

  // Populate data via REST PATCH (works without DDL if columns exist)
  console.log('📝 Updating free plan...');
  try {
    await restPatch('subscription_plans', { id: 'eq.free' }, {
      display_features: [
        '৩টি পরীক্ষা/দিন', '১০টি প্র্যাক্টিস প্রশ্ন/দিন', 'সব সিমুলেশন',
        '৫টি ক্লাস ভিডিও', 'AI টিউটর ৩ প্রশ্ন/দিন', 'বেসিক ড্যাশবোর্ড'
      ],
      badge_text: '',
      highlight: false,
      cta_text: 'বর্তমান প্ল্যান',
      period_text: 'সবসময়',
      sort_order: 1,
    });
    console.log('  ✅ free updated');
  } catch (e) {
    console.log('  ❌ free failed:', e.message);
  }

  console.log('📝 Updating premium plan...');
  try {
    await restPatch('subscription_plans', { id: 'eq.premium' }, {
      display_features: [
        'আনলিমিটেড পরীক্ষা', 'আনলিমিটেড প্র্যাক্টিস', 'সব ক্লাস ভিডিও',
        'AI টিউটর ২০ প্রশ্ন/দিন', 'সার্টিফিকেট', 'বিজ্ঞাপন মুক্ত'
      ],
      badge_text: 'জনপ্রিয়',
      highlight: true,
      cta_text: 'বিকাশে পে করো',
      period_text: '/মাস',
      sort_order: 2,
    });
    console.log('  ✅ premium updated');
  } catch (e) {
    console.log('  ❌ premium failed:', e.message);
  }

  console.log('📝 Updating pro plan...');
  try {
    await restPatch('subscription_plans', { id: 'eq.pro' }, {
      display_features: [
        'প্রিমিয়ামের সব কিছু', 'AI টিউটর ৫০ প্রশ্ন/দিন', 'অফলাইন ডাউনলোড',
        'অগ্রাধিকার সাপোর্ট', 'নতুন ফিচার আগে পাবে', 'সার্টিফিকেট'
      ],
      badge_text: '',
      highlight: false,
      cta_text: 'বিকাশে পে করো',
      period_text: '/মাস',
      sort_order: 3,
    });
    console.log('  ✅ pro updated');
  } catch (e) {
    console.log('  ❌ pro failed:', e.message);
  }

  // Verify
  console.log('');
  console.log('🔍 Verifying...');
  const res = await fetch(`${SUPABASE_URL}/rest/v1/subscription_plans?select=id,name_bn,display_features,sort_order,highlight&order=sort_order`, { headers });
  const result = await res.json();
  console.table(result.map(p => ({
    id: p.id,
    name: p.name_bn,
    features: (p.display_features || []).length,
    sort: p.sort_order,
    highlight: p.highlight,
  })));
  console.log('');
  console.log('✅ Done!');
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
