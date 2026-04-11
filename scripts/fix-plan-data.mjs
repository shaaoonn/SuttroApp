const SB_URL = 'https://api.suttro.app';
const SB_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NTQ2NDY4MCwiZXhwIjo0OTMxMTM4MjgwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.B5_VLO2pONHEh83FOn1LtNLAlzrz09R16SMRDBsAzeQ';

const headers = {
  'apikey': SB_KEY,
  'Authorization': `Bearer ${SB_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
};

const plans = [
  {
    id: 'free',
    display_features: [
      '৩টি পরীক্ষা/দিন',
      '১০টি প্র্যাক্টিস প্রশ্ন/দিন',
      'সব সিমুলেশন',
      '৫টি ক্লাস ভিডিও',
      'AI টিউটর ৩ প্রশ্ন/দিন',
      'বেসিক ড্যাশবোর্ড',
    ],
    badge_text: '',
    cta_text: 'বর্তমান প্ল্যান',
    period_text: 'সবসময়',
    highlight: false,
    sort_order: 1,
  },
  {
    id: 'premium',
    display_features: [
      'আনলিমিটেড পরীক্ষা',
      'আনলিমিটেড প্র্যাক্টিস',
      'সব ক্লাস ভিডিও',
      'AI টিউটর ২০ প্রশ্ন/দিন',
      'সার্টিফিকেট',
      'বিজ্ঞাপন মুক্ত',
    ],
    badge_text: 'জনপ্রিয়',
    cta_text: 'বিকাশে পে করো',
    period_text: '/মাস',
    highlight: true,
    sort_order: 2,
  },
  {
    id: 'pro',
    display_features: [
      'প্রিমিয়ামের সব কিছু',
      'AI টিউটর ৫০ প্রশ্ন/দিন',
      'অফলাইন ডাউনলোড',
      'অগ্রাধিকার সাপোর্ট',
      'নতুন ফিচার আগে পাবে',
      'সার্টিফিকেট',
    ],
    badge_text: '',
    cta_text: 'বিকাশে পে করো',
    period_text: '/মাস',
    highlight: false,
    sort_order: 3,
  },
];

async function main() {
  for (const plan of plans) {
    const { id, ...data } = plan;
    const res = await fetch(`${SB_URL}/rest/v1/subscription_plans?id=eq.${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(`❌ ${id}: ${err}`);
    } else {
      console.log(`✅ ${id} updated`);
    }
  }

  // Verify
  const res = await fetch(`${SB_URL}/rest/v1/subscription_plans?select=id,name_bn,display_features,badge_text,highlight,cta_text,period_text,sort_order&order=sort_order`, { headers });
  const result = await res.json();
  for (const p of result) {
    console.log(`\n📦 ${p.name_bn} (${p.id}):`);
    console.log(`   Badge: "${p.badge_text}" | Highlight: ${p.highlight} | CTA: "${p.cta_text}" | Period: "${p.period_text}" | Sort: ${p.sort_order}`);
    console.log(`   Features: ${p.display_features.join(', ')}`);
  }
}

main().catch(console.error);
