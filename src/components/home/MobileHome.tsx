'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// MobileHome - App-style home screen (mobile only)
// Matches the 10-page design reference exactly
// ─────────────────────────────────────────────

const SUBJECTS = [
  {
    key: 'physics',
    label: 'পদার্থ',
    detail: '১৩ অধ্যায়',
    icon: '⚡',
    color: '#3B82F6',
    light: '#60A5FA',
    textColor: '#1E40AF',
    border: '#BFDBFE',
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    shadow: 'rgba(59,130,246,0.2)',
    href: '/guide/physics',
  },
  {
    key: 'chemistry',
    label: 'রসায়ন',
    detail: '১১ অধ্যায়',
    icon: '⚗️',
    color: '#7C3AED',
    light: '#A78BFA',
    textColor: '#5B21B6',
    border: '#DDD6FE',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    shadow: 'rgba(139,92,246,0.2)',
    href: '/guide/chemistry',
  },
  {
    key: 'biology',
    label: 'জীববিজ্ঞান',
    detail: '১২ অধ্যায়',
    icon: '🧬',
    color: '#EC4899',
    light: '#F472B6',
    textColor: '#9D174D',
    border: '#FBCFE8',
    gradient: 'linear-gradient(135deg, #DB2777, #EC4899)',
    shadow: 'rgba(236,72,153,0.2)',
    href: '/guide/biology',
  },
];

const QUICK_LINKS = [
  {
    href: '/exams',
    icon: '📝',
    label: 'MCQ পরীক্ষা',
    detail: '৮৪০+ প্রশ্ন',
    gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)',
  },
  {
    href: '/review',
    icon: '🔄',
    label: 'SRS রিভিউ',
    detail: 'স্পেসড রিপিটিশন',
    gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
  },
  {
    href: '/achievements',
    icon: '🎖️',
    label: 'অ্যাচিভমেন্ট',
    detail: 'ব্যাজ সংগ্রহ',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
  },
  {
    href: '/leaderboard',
    icon: '🏆',
    label: 'লিডারবোর্ড',
    detail: 'র‍্যাংকিং দেখো',
    gradient: 'linear-gradient(135deg, #EC4899, #F472B6)',
  },
];

type ContentMap = Record<string, string>;

interface MobileHomeProps {
  latestClass: {
    title: string;
    slug: string;
    duration: string;
  } | null;
  content?: ContentMap;
  quicklinks?: ContentMap;
  subjects?: ContentMap;
}

export default function MobileHome({ latestClass, content = {}, quicklinks = {} }: MobileHomeProps) {
  const { user } = useAuth();
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    '';
  const firstName = displayName ? displayName.split(' ')[0] : '';

  return (
    <div className="flex flex-col">
      {/* ── Hero Section ── */}
      <section
        className="text-center"
        style={{
          background: 'linear-gradient(160deg, #F0FDFA, #F5F3FF 60%, #FEF3C7)',
          padding: '24px 16px 20px',
        }}
      >
        <p className="text-sm font-semibold mb-1" style={{ color: '#0D9488' }}>
          {user
            ? `👋 স্বাগতম, ${firstName || 'শিক্ষার্থী'}!`
            : '👋 স্বাগতম!'}
        </p>
        <h1
          className="text-xl font-bold mb-1"
          style={{ color: '#134E4A', lineHeight: 1.3 }}
        >
          {user ? 'আজ কী শিখবে?' : (content.welcome_guest_title || 'বিজ্ঞান দেখো, বিজ্ঞান বোঝো')}
        </h1>
        <p className="text-sm mb-4" style={{ color: '#5F9EA0' }}>
          {user
            ? 'তোমার streak চলছে - দারুণ!'
            : (content.mobile_guest_subtitle || 'ক্লাস ৯-১০ ইন্টারেক্টিভ সিমুলেশন')}
        </p>
        <div className="flex gap-2 justify-center">
          <Link
            href="/simulations"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold text-white suttro-transition hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
              boxShadow: '0 4px 14px rgba(13,148,136,0.25)',
            }}
          >
            {content.sim_cta || 'সিমুলেশন চালাও'}
          </Link>
          <Link
            href={user ? '/classes' : '/login'}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold suttro-transition"
            style={{
              color: '#0D9488',
              background: 'white',
              border: '1.5px solid #99F6E4',
            }}
          >
            {user ? 'ক্লাস দেখো' : 'লগ ইন'}
          </Link>
        </div>
      </section>

      {/* ── Content Cards ── */}
      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Subject Cards Row */}
        <div className="flex gap-2">
          {SUBJECTS.map((sub) => (
            <Link
              key={sub.key}
              href={sub.href}
              className="flex-1 rounded-xl p-3 text-center suttro-transition active:scale-[0.97]"
              style={{ background: 'white', border: `1px solid ${sub.border}` }}
            >
              <div
                className="w-9 h-9 mx-auto mb-1.5 rounded-[10px] flex items-center justify-center text-white text-base"
                style={{
                  background: sub.gradient,
                  boxShadow: `0 3px 10px ${sub.shadow}`,
                }}
              >
                {sub.icon}
              </div>
              <div
                className="text-xs font-semibold"
                style={{ color: sub.textColor }}
              >
                {sub.label}
              </div>
              <div className="text-[11px]" style={{ color: sub.light }}>
                {sub.detail}
              </div>
            </Link>
          ))}
        </div>

        {/* Daily Progress */}
        <div
          className="rounded-xl p-3"
          style={{ background: 'white', border: '1px solid #CCFBF1' }}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span
              className="text-sm font-semibold"
              style={{ color: '#134E4A' }}
            >
              {content.today_progress || 'আজকের প্রগ্রেস'}
            </span>
            <span
              className="text-[13px] font-medium"
              style={{ color: '#2DD4BF' }}
            >
              0%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full"
            style={{ background: '#F0FDFA' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: '0%',
                background: 'linear-gradient(90deg, #0D9488, #2DD4BF)',
                boxShadow: '0 1px 6px rgba(13,148,136,0.25)',
              }}
            />
          </div>
        </div>

        {/* New Class Card */}
        {latestClass && (
          <Link
            href={`/class/${latestClass.slug}`}
            className="rounded-xl p-3 flex items-center gap-3 suttro-transition active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
              border: '1px solid #FDE68A',
            }}
          >
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-base flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                boxShadow: '0 3px 10px rgba(245,158,11,0.25)',
              }}
            >
              ▶
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-semibold"
                style={{ color: '#92400E' }}
              >
                {content.new_class_label || 'নতুন ক্লাস!'}
              </div>
              <div
                className="text-xs truncate"
                style={{ color: '#B45309' }}
              >
                {latestClass.title} - {latestClass.duration}
              </div>
            </div>
          </Link>
        )}

        {/* আজকের পড়া */}
        <Link
          href="/daily"
          className="rounded-xl p-3 flex items-center gap-3 suttro-transition active:scale-[0.98]"
          style={{ background: 'white', border: '1px solid #BFDBFE' }}
        >
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white text-sm flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
            }}
          >
            📖
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-semibold"
              style={{ color: '#1E40AF' }}
            >
              {content.daily_study_title || 'আজকের পড়া'}
            </div>
            <div className="text-xs" style={{ color: '#60A5FA' }}>
              {content.daily_study_subtitle || 'ক্লাস, MCQ, বাড়ির কাজ'}
            </div>
          </div>
          <span
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
              boxShadow: '0 4px 14px rgba(13,148,136,0.25)',
            }}
          >
            {content.start_btn || 'শুরু'}
          </span>
        </Link>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl p-3 flex items-center gap-2.5 suttro-transition active:scale-[0.97]"
              style={{ background: 'white', border: '1px solid #F0F4F3' }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0"
                style={{ background: link.gradient }}
              >
                {link.icon}
              </div>
              <div className="min-w-0">
                <div
                  className="text-xs font-semibold"
                  style={{ color: '#134E4A' }}
                >
                  {link.label}
                </div>
                <div
                  className="text-[10px]"
                  style={{ color: '#94A3B8' }}
                >
                  {link.detail}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
