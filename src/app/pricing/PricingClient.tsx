'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// Pricing — Plan cards
// Design reference Page 8
// ─────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  price: string;
  priceBDT: number;
  period: string;
  highlight: boolean;
  badgeText: string;
  features: string[];
  cta: string;
}

export default function PricingClient() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    fetch('/api/plans')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlans(data);
        setPlansLoading(false);
      })
      .catch(() => {
        setError('প্ল্যান লোড করতে সমস্যা হয়েছে');
        setPlansLoading(false);
      });
  }, []);

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
      if (!res.ok) throw new Error(data.error || 'Payment initiation failed');
      window.location.href = data.bkashURL;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কিছু একটা ভুল হয়েছে');
      setLoading(null);
    }
  }

  // Determine button style per plan
  function getButtonStyle(plan: Plan) {
    if (plan.id === 'free') {
      return {
        background: '#F8FAFB',
        color: '#94A3B8',
        cursor: 'default' as const,
      };
    }
    if (plan.highlight) {
      return {
        background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
        color: 'white',
        boxShadow: '0 4px 14px rgba(13,148,136,0.25)',
      };
    }
    // Pro plan
    return {
      background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      color: 'white',
      boxShadow: '0 4px 14px rgba(245,158,11,0.25)',
    };
  }

  return (
    <div
      className="flex-1"
      style={{
        background: 'linear-gradient(160deg, #F0FDFA, #F5F3FF)',
      }}
    >
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Title */}
        <div className="text-center mb-4">
          <h1
            className="text-lg font-bold"
            style={{ color: '#134E4A' }}
          >
            তোমার জন্য সেরা প্ল্যান
          </h1>
          <p className="text-xs" style={{ color: '#5F9EA0' }}>
            যেকোনো সময় বাতিল করা যাবে
          </p>
        </div>

        {error && (
          <div
            className="rounded-[10px] px-4 py-3 text-sm mb-4 text-center"
            style={{ background: '#FEE2E2', color: '#DC2626' }}
          >
            {error}
          </div>
        )}

        {plansLoading ? (
          <div className="text-center py-16">
            <div className="text-3xl mb-3 animate-pulse">⏳</div>
            <p style={{ color: '#94A3B8' }}>প্ল্যান লোড হচ্ছে...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-xl p-3.5 relative"
                style={{
                  background: 'white',
                  border: plan.highlight
                    ? '2px solid #0D9488'
                    : '1px solid #F0F4F3',
                }}
              >
                {/* Badge */}
                {plan.badgeText && (
                  <span
                    className="absolute -top-2 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
                    style={{
                      background:
                        'linear-gradient(135deg, #0D9488, #14B8A6)',
                    }}
                  >
                    {plan.badgeText}
                  </span>
                )}

                {/* Plan header */}
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div
                      className="text-base font-bold"
                      style={{
                        color: plan.highlight
                          ? '#0D9488'
                          : plan.id === 'free'
                          ? '#134E4A'
                          : '#F59E0B',
                      }}
                    >
                      {plan.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: '#5F9EA0' }}
                    >
                      {plan.id === 'free'
                        ? 'বেসিক ফিচার'
                        : plan.highlight
                        ? 'সব কিছু আনলিমিটেড'
                        : 'সর্বোচ্চ সুবিধা'}
                    </div>
                  </div>
                  <div>
                    <span
                      className="text-xl font-bold"
                      style={{
                        color: plan.highlight
                          ? '#0D9488'
                          : plan.id === 'free'
                          ? '#134E4A'
                          : '#F59E0B',
                      }}
                    >
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span
                        className="text-xs"
                        style={{ color: '#5F9EA0' }}
                      >
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Features */}
                <div
                  className="text-xs leading-relaxed mb-3"
                  style={{ color: '#5F9EA0' }}
                >
                  {plan.features.map((f, i) => (
                    <span key={i}>
                      <span style={{ color: '#10B981' }}>&#10003;</span>{' '}
                      {f}
                      {i < plan.features.length - 1 && '\u00A0\u00A0'}
                    </span>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id || plan.id === 'free'}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold suttro-transition hover:opacity-90 disabled:opacity-50"
                  style={getButtonStyle(plan)}
                >
                  {loading === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      বিকাশে যাচ্ছে...
                    </span>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <p
          className="text-center text-[11px] mt-4"
          style={{ color: '#94A3B8' }}
        >
          পেমেন্ট নিরাপদ — বিকাশ পেমেন্ট গেটওয়ে দ্বারা পরিচালিত
        </p>
      </div>
    </div>
  );
}
