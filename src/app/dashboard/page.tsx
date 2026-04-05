'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// ─────────────────────────────────────────────
// Dashboard — User learning progress
// Protected: redirects to /login if not logged in
// ─────────────────────────────────────────────

const RECENT_ITEMS = [
  { type: 'sim', title: 'ওহমের সূত্র', subject: 'পদার্থবিজ্ঞান', href: '/sim/ohms-law' },
];

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">⏳</div>
          <p style={{ color: 'var(--suttro-muted)' }}>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
              ড্যাশবোর্ড
            </h1>
            <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
              {user.phone ? `${user.phone} — ` : ''}তোমার শেখার অগ্রগতি এক নজরে।
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 rounded-[10px] text-sm font-medium border suttro-transition hover:bg-black/5"
            style={{ borderColor: 'var(--suttro-border)', color: 'var(--suttro-muted)' }}
          >
            লগ আউট
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
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

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
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

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            href="/simulations"
            className="rounded-[14px] p-5 text-center suttro-transition hover:opacity-80"
            style={{ background: 'var(--suttro-sky)' }}
          >
            <div className="text-2xl mb-2">🔬</div>
            <div className="text-sm font-medium" style={{ color: 'var(--suttro-deep)' }}>
              সিমুলেশন
            </div>
          </Link>
          <Link
            href="/classes"
            className="rounded-[14px] p-5 text-center suttro-transition hover:opacity-80"
            style={{ background: 'var(--suttro-sky)' }}
          >
            <div className="text-2xl mb-2">📹</div>
            <div className="text-sm font-medium" style={{ color: 'var(--suttro-deep)' }}>
              ক্লাস আর্কাইভ
            </div>
          </Link>
          <Link
            href="/pricing"
            className="rounded-[14px] p-5 text-center suttro-transition hover:opacity-80"
            style={{ background: 'var(--suttro-sky)' }}
          >
            <div className="text-2xl mb-2">💎</div>
            <div className="text-sm font-medium" style={{ color: 'var(--suttro-deep)' }}>
              প্রিমিয়াম
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
