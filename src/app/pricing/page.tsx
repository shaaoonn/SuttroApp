import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'প্রাইসিং — সূত্র | suttro.app',
};

const PLANS = [
  {
    name: 'ফ্রি',
    price: '৳০',
    period: 'সবসময়',
    highlight: false,
    features: [
      '৫টি সিমুলেশন',
      '৫টি ক্লাস ভিডিও',
      'অনলাইন শুধু',
      'বেসিক সাপোর্ট',
    ],
    cta: 'ফ্রি শুরু করো',
    ctaHref: '/simulations',
  },
  {
    name: 'প্রিমিয়াম',
    price: '৳299',
    period: '/মাস',
    highlight: true,
    features: [
      'সব সিমুলেশন',
      'সব ক্লাস ভিডিও',
      'অফলাইন ডাউনলোড',
      'অগ্রাধিকার সাপোর্ট',
      'নতুন সিমুলেশন আগে পাবে',
    ],
    cta: 'প্রিমিয়াম নাও',
    ctaHref: '/login',
  },
];

export default function PricingPage() {
  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
            প্রাইসিং
          </h1>
          <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
            ফ্রি দিয়ে শুরু করো — আপগ্রেড করো যখন দরকার।
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[14px] border p-6 md:p-8 ${plan.highlight ? 'ring-2' : ''}`}
              style={{
                borderColor: plan.highlight ? 'var(--suttro-primary)' : 'var(--suttro-border)',
                background: 'var(--suttro-white)',
                ...(plan.highlight ? { ringColor: 'var(--suttro-primary)' } : {}),
              }}
            >
              {plan.highlight && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-4"
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
                <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--suttro-text)' }}>
                    <span style={{ color: 'var(--suttro-primary-light)' }}>&#10003;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                className="block text-center py-3 rounded-[10px] text-sm font-medium suttro-transition"
                style={
                  plan.highlight
                    ? { background: 'var(--suttro-primary)', color: 'white' }
                    : { background: 'transparent', color: 'var(--suttro-primary)', border: '1.5px solid var(--suttro-primary)' }
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
