import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ড্যাশবোর্ড — সূত্র | suttro.app',
};

const RECENT_ITEMS = [
  { type: 'sim', title: 'ওহমের সূত্র', subject: 'পদার্থবিজ্ঞান', href: '/sim/ohms-law' },
];

export default function DashboardPage() {
  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--suttro-deep)' }}>
          ড্যাশবোর্ড
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--suttro-muted)' }}>
          তোমার শেখার অগ্রগতি এক নজরে।
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'সিমুলেশন দেখেছ', value: '1' },
            { label: 'ক্লাস দেখেছ', value: '0' },
            { label: 'ডাউনলোড', value: '0' },
            { label: 'বুকমার্ক', value: '0' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[14px] border p-5 text-center"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
            >
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--suttro-primary)' }}
              >
                {stat.value}
              </div>
              <div className="text-xs" style={{ color: 'var(--suttro-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div
            className="rounded-[14px] border p-6"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--suttro-deep)' }}>
              সম্প্রতি দেখেছ
            </h2>
            {RECENT_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-3 rounded-[10px] hover:bg-black/5 suttro-transition"
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: 'var(--suttro-text)' }}>
                    {item.title}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--suttro-muted)' }}>
                    {item.subject}
                  </div>
                </div>
                <span style={{ color: 'var(--suttro-primary)' }}>&rarr;</span>
              </Link>
            ))}
          </div>

          {/* Offline Downloads */}
          <div
            className="rounded-[14px] border p-6"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--suttro-deep)' }}>
              অফলাইন ডাউনলোড
            </h2>
            <div className="text-center py-8">
              <div className="text-3xl mb-3">📥</div>
              <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                কোনো ডাউনলোড নেই। সিমুলেশন পেজ থেকে ডাউনলোড করো।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
