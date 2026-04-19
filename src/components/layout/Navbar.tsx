'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import MobileMenu from './MobileMenu';

// ─────────────────────────────────────────────
// Navbar - সূত্র | suttro.app
// [Logo]  বিষয়▾  সিমুলেশন  ক্লাস আর্কাইভ  আমাদের সম্পর্কে  [লগ ইন]
// Mobile: Hamburger (☰)
// ─────────────────────────────────────────────

const NAV_LINKS = [
  { href: '/guide', label: 'গাইড' },
  { href: '/exams', label: 'পরীক্ষা' },
  { href: '/simulations', label: 'সিমুলেশন' },
  { href: '/classes', label: 'ক্লাস' },
  { href: '/daily', label: 'চ্যালেঞ্জ' },
  { href: '/pricing', label: 'প্রাইসিং' },
];

const SUBJECT_LINKS = [
  { href: '/guide/physics', label: 'পদার্থবিজ্ঞান', color: 'bg-physics', icon: '⚡' },
  { href: '/guide/chemistry', label: 'রসায়ন', color: 'bg-chemistry', icon: '🧪' },
  { href: '/guide/biology', label: 'জীববিজ্ঞান', color: 'bg-biology', icon: '🧬' },
  { href: '/guide/math', label: 'সাধারণ গণিত', color: 'bg-subject-math', icon: '📐' },
  { href: '/guide/higher-math', label: 'উচ্চতর গণিত', color: 'bg-subject-higher-math', icon: '📊' },
];

export default function Navbar() {
  const { user, session, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch('/api/xp', { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) { setStreak(data.current_streak ?? 0); setXp(data.total_xp ?? 0); }
      })
      .catch(() => {});
  }, [session?.access_token]);

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: '#F0F4F3',
        }}
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16 lg:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="সূত্র | suttro.app"
              width={120}
              height={40}
              className="h-9 w-auto lg:h-10"
              priority
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Subject dropdown */}
            <div className="relative">
              <button
                onClick={() => setSubjectOpen(!subjectOpen)}
                onBlur={() => setTimeout(() => setSubjectOpen(false), 150)}
                className="px-3 py-2 rounded-[10px] text-sm hover:bg-black/5 suttro-transition"
                style={{ color: 'var(--suttro-text)' }}
              >
                বিষয় ▾
              </button>
              {subjectOpen && (
                <div
                  className="absolute top-full left-0 mt-1 py-2 rounded-[14px] shadow-lg min-w-[180px] border"
                  style={{
                    background: 'var(--suttro-white)',
                    borderColor: 'var(--suttro-border)',
                  }}
                >
                  {SUBJECT_LINKS.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-black/5 suttro-transition"
                      style={{ color: 'var(--suttro-text)' }}
                    >
                      <span className="text-base">{s.icon}</span>
                      {s.label}
                    </Link>
                  ))}
                  <div className="border-t my-1" style={{ borderColor: 'var(--suttro-border)' }} />
                  <Link
                    href="/guide"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-black/5 suttro-transition"
                    style={{ color: 'var(--suttro-primary)' }}
                  >
                    📚 সব বিষয় দেখো
                  </Link>
                </div>
              )}
            </div>

            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-[10px] text-sm hover:bg-black/5 suttro-transition"
                style={{ color: 'var(--suttro-text)' }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {!loading && (
              user ? (
                <div className="hidden lg:flex items-center gap-1">
                  {streak > 0 && (
                    <Link href="/dashboard" className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-white"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}>
                      🔥 {streak}
                    </Link>
                  )}
                  {xp > 0 && (
                    <Link href="/dashboard" className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px] text-xs font-medium"
                      style={{ background: '#F0FDFA', color: '#0D9488' }}>
                      ✨ {xp}
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 rounded-[10px] text-sm font-medium suttro-transition hover:bg-black/5"
                    style={{ color: 'var(--suttro-primary)' }}
                  >
                    ড্যাশবোর্ড
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm font-medium suttro-transition hover:bg-black/5"
                    style={{ color: 'var(--suttro-text)' }}
                  >
                    {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.user_metadata.avatar_url || user.user_metadata.picture}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: 'linear-gradient(135deg, #0D9488, #2DD4BF)' }}
                      >
                        {user.user_metadata?.full_name?.charAt(0)?.toUpperCase()
                          || user.email?.charAt(0)?.toUpperCase()
                          || user.phone?.slice(-2)
                          || '?'}
                      </span>
                    )}
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden lg:inline-flex items-center px-4 py-2 rounded-[12px] text-sm font-medium text-white suttro-transition"
                  style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)', boxShadow: '0 4px 14px rgba(13,148,136,0.25)' }}
                >
                  লগ ইন
                </Link>
              )
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-[10px] hover:bg-black/5"
              style={{ color: 'var(--suttro-text)' }}
              aria-label="মেনু"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path d="M6 6l12 12M6 18L18 6" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={NAV_LINKS}
        subjectLinks={SUBJECT_LINKS}
        user={user}
      />
    </>
  );
}
