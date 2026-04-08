'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const PLANS = [
  {
    id: 'free' as const,
    name: 'ফ্রি',
    price: '৳০',
    priceBDT: 0,
    period: 'সবসময়',
    highlight: false,
    features: [
      '৩টি পরীক্ষা/দিন',
      '১০টি প্র্যাক্টিস প্রশ্ন/দিন',
      'সব সিমুলেশন',
      '৫টি ক্লাস ভিডিও',
      'AI টিউটর ৩ প্রশ্ন/দিন',
      'বেসিক ড্যাশবোর্ড',
    ],
    cta: 'ফ্রি শুরু করো',
  },
  {
    id: 'premium' as const,
    name: 'প্রিমিয়াম',
    price: '৳৯৯',
    priceBDT: 99,
    period: '/মাস',
    highlight: true,
    features: [
      'আনলিমিটেড পরীক্ষা',
      'আনলিমিটেড প্র্যাক্টিস',
      'সব ক্লাস ভিডিও',
      'AI টিউটর ২০ প্রশ্ন/দিন',
      'সার্টিফিকেট',
      'বিজ্ঞাপন মুক্ত',
    ],
    cta: 'বিকাশে পে করো',
  },
  {
    id: 'pro' as const,
    name: 'প্রো',
    price: '৳১৯৯',
    priceBDT: 199,
    period: '/মাস',
    highlight: false,
    features: [
      'প্রিমিয়ামের সব কিছু',
      'AI টিউটর ৫০ প্রশ্ন/দিন',
      'অফলাইন ডাউনলোড',
      'অগ্রাধিকার সাপোর্ট',
      'নতুন ফিচার আগে পাবে',
      'সার্টিফিকেট',
    ],
    cta: 'বিকাশে পে করো',
  },
];

export default function PricingClient() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(planId: string) {
    if (planId === 'free') return;

    if (!user || !session) {
      window.location.href = '/login';
      return;
    }

    setLoading(planId);
    setError(null);

    try {
      const res = await fetch('/api/payment/bkash/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      // Redirect to bKash payment page
      window.location.href = data.bkashURL;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কিছু একটা ভুল হয়েছে');
      setLoading(null);
    }
  }

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            প্রাইসিং
          </h1>
          <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
            ফ্রি দিয়ে শুরু করো — আপগ্রেড করো যখন দরকার।
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 rounded-lg text-center text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[14px] border p-6 md:p-8 flex flex-col ${plan.highlight ? 'ring-2' : ''}`}
              style={{
                borderColor: plan.highlight ? 'var(--suttro-primary)' : 'var(--suttro-border)',
                background: 'var(--suttro-white)',
                ...(plan.highlight ? { ringColor: 'var(--suttro-primary)' } : {}),
              }}
            >
              {plan.highlight && (
                <span
                  className="inline-block px-3 py-1.5 rounded-full text-sm font-medium text-white mb-4 self-start"
                  style={{ background: 'var(--suttro-accent)' }}
                >
                  জনপ্রিয়
                </span>
              )}
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
                {plan.name}
              </h2>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold" style={{ color: 'var(--suttro-deep)' }}>
                  {plan.price}
                </span>
                <span className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-base" style={{ color: 'var(--suttro-text)' }}>
                    <span style={{ color: 'var(--suttro-primary-light)' }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id || plan.id === 'free'}
                className="block w-full text-center py-3 rounded-[10px] text-base font-medium suttro-transition disabled:opacity-50"
                style={
                  plan.highlight
                    ? { background: 'var(--suttro-primary)', color: 'white' }
                    : plan.id === 'free'
                    ? { background: 'var(--suttro-surface)', color: 'var(--suttro-muted)', cursor: 'default' }
                    : { background: 'transparent', color: 'var(--suttro-primary)', border: '1.5px solid var(--suttro-primary)' }
                }
              >
                {loading === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    বিকাশে যাচ্ছে...
                  </span>
                ) : plan.id === 'free' ? (
                  'বর্তমান প্ল্যান'
                ) : (
                  <>
                    <span className="inline-block mr-1.5" style={{ color: '#E2136E' }}>⬤</span>
                    {plan.cta}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            পেমেন্ট নিরাপদ — বিকাশ পেমেন্ট গেটওয়ে দ্বারা পরিচালিত
          </p>
        </div>
      </div>
    </div>
  );
}
