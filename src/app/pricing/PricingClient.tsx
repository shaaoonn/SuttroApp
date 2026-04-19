'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { SkeletonList } from '@/components/native/Skeleton';
import { isNativeApp } from '@/lib/native-bridge';

// ─────────────────────────────────────────────
// Open bKash payment URL. Inside the Android app, the native WebView's
// shouldOverrideUrlLoading() keeps all https:// redirects in-app so the
// bKash flow stays INSIDE the app (no external browser). On the public web
// this just navigates the current tab. Capacitor.Browser is intentionally
// NOT used - the Android shell is pure Kotlin, not Capacitor.
//
// NOTE: On native Android, paid subscriptions are intentionally hidden to
// comply with Google Play's billing policy (digital goods must use Play
// Billing on Android; bKash is our web-only payment path). Native users
// see a "upgrade on web" notice instead.
// ─────────────────────────────────────────────
async function openPaymentURL(url: string) {
  window.location.href = url;
}

// ─────────────────────────────────────────────
// Pricing - Plan cards + Donation
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
  const [donateAmount, setDonateAmount] = useState('');
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateSuccess, setDonateSuccess] = useState(false);
  const [isNative, setIsNative] = useState(false);

  // Detect native Android app - we hide paid plan CTAs & donation in native
  // per Google Play's digital-goods billing policy. Users are shown a notice
  // to upgrade on suttro.app via a web browser.
  useEffect(() => {
    setIsNative(isNativeApp());
  }, []);

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
      await openPaymentURL(data.bkashURL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কিছু একটা ভুল হয়েছে');
      setLoading(null);
    }
  }

  async function handleDonate() {
    const amount = parseInt(donateAmount);
    if (!amount || amount < 10) {
      setError('সর্বনিম্ন ১০ টাকা দিতে হবে');
      return;
    }
    if (!user || !session) {
      window.location.href = '/login';
      return;
    }
    setDonateLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/payment/bkash/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ planId: 'donation', amount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment initiation failed');
      await openPaymentURL(data.bkashURL);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কিছু একটা ভুল হয়েছে');
      setDonateLoading(false);
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
          <SkeletonList count={3} />
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

                {/* CTA Button
                   On native Android: paid plans show a plain notice instead
                   of a payment CTA (Google Play billing policy compliance).
                   Free plan still shows a disabled "current plan" button. */}
                {isNative && plan.id !== 'free' ? (
                  <div
                    className="w-full py-2.5 rounded-xl text-xs text-center leading-snug"
                    style={{
                      background: '#F8FAFB',
                      color: '#64748B',
                      border: '1px dashed #E2E8F0',
                    }}
                  >
                    আপগ্রেড করতে ব্রাউজারে <span style={{ fontWeight: 600 }}>suttro.app</span> ভিজিট করো
                  </div>
                ) : (
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
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══ Donate Section ═══
            Hidden in native Android app - bKash donations on Android are
            out of policy scope under Google Play's digital-goods rules.
            Donations remain available on suttro.app in a web browser. */}
        {!isNative && (
        <div
          className="mt-6 rounded-xl p-4"
          style={{
            background: 'white',
            border: '1px solid #F0F4F3',
          }}
        >
          <div className="text-center mb-3">
            <div className="text-2xl mb-1">💝</div>
            <h2 className="text-base font-bold" style={{ color: '#134E4A' }}>
              ডোনেট করো
            </h2>
            <p className="text-xs mt-1" style={{ color: '#5F9EA0' }}>
              সূত্র-কে এগিয়ে নিতে তোমার ইচ্ছামতো পরিমাণ দাও
            </p>
          </div>

          {/* Quick amount buttons */}
          <div className="flex gap-2 mb-3">
            {['50', '100', '200', '500'].map((amt) => (
              <button
                key={amt}
                onClick={() => setDonateAmount(amt)}
                className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: donateAmount === amt
                    ? 'linear-gradient(135deg, #EC4899, #F472B6)'
                    : '#F8FAFB',
                  color: donateAmount === amt ? 'white' : '#64748B',
                  border: donateAmount === amt ? 'none' : '1px solid #E2E8F0',
                }}
              >
                ৳{amt}
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <div
            className="flex rounded-xl overflow-hidden mb-3"
            style={{ border: '1.5px solid #E2E8F0' }}
          >
            <span
              className="flex items-center px-3 text-sm font-semibold"
              style={{
                background: '#F8FAFB',
                color: '#94A3B8',
                borderRight: '1px solid #E2E8F0',
              }}
            >
              ৳
            </span>
            <input
              type="number"
              placeholder="তোমার পরিমাণ লেখো"
              value={donateAmount}
              onChange={(e) => setDonateAmount(e.target.value.replace(/\D/g, ''))}
              min="10"
              className="flex-1 px-3 py-2.5 text-sm outline-none"
              style={{ color: '#134E4A' }}
            />
          </div>

          {donateSuccess ? (
            <div className="text-center py-2 text-sm font-semibold" style={{ color: '#16A34A' }}>
              ধন্যবাদ! তোমার ডোনেশন গৃহীত হয়েছে 💚
            </div>
          ) : (
            <button
              onClick={handleDonate}
              disabled={donateLoading || !donateAmount || parseInt(donateAmount) < 10}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white suttro-transition hover:opacity-90 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #EC4899, #F472B6)',
                boxShadow: '0 4px 14px rgba(236,72,153,0.25)',
              }}
            >
              {donateLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  বিকাশে যাচ্ছে...
                </span>
              ) : (
                `💝 ৳${donateAmount || '0'} ডোনেট করো`
              )}
            </button>
          )}
        </div>
        )}

        {/* Native-app notice - explain why upgrade/donate CTAs are not shown */}
        {isNative ? (
          <div
            className="mt-6 rounded-xl p-4 text-center"
            style={{
              background: 'linear-gradient(135deg, #F0FDFA, #F5F3FF)',
              border: '1px solid #E0F2F1',
            }}
          >
            <div className="text-xl mb-1">🌐</div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#134E4A' }}>
              প্রিমিয়াম আপগ্রেড ও ডোনেশন
            </p>
            <p className="text-[11px] leading-relaxed" style={{ color: '#5F9EA0' }}>
              ব্রাউজারে <span style={{ fontWeight: 600 }}>suttro.app</span> ভিজিট করে
              তুমি প্রিমিয়াম প্ল্যানে আপগ্রেড করতে পারবে বা ডোনেট করতে পারবে।
            </p>
          </div>
        ) : (
          <p
            className="text-center text-[11px] mt-4"
            style={{ color: '#94A3B8' }}
          >
            পেমেন্ট নিরাপদ - বিকাশ পেমেন্ট গেটওয়ে দ্বারা পরিচালিত
          </p>
        )}

        {/* Refund policy link - always visible (Play Store compliance) */}
        <p
          className="text-center text-[11px] mt-2"
          style={{ color: '#94A3B8' }}
        >
          <a
            href="/refund"
            className="underline"
            style={{ color: '#0D9488' }}
          >
            রিফান্ড ও বাতিলকরণ নীতি
          </a>
        </p>
      </div>
    </div>
  );
}
