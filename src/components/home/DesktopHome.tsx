'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// DesktopHome — Dashboard for logged-in desktop users
// Shows subjects, daily study, recent classes, exams
// ─────────────────────────────────────────────

const SUBJECTS = [
  {
    key: 'physics',
    label: 'পদার্থবিজ্ঞান',
    detail: '১৩ অধ্যায়',
    icon: '⚡',
    gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
    border: '#BFDBFE',
    textColor: '#1E40AF',
    shadow: 'rgba(59,130,246,0.15)',
    href: '/guide/physics',
  },
  {
    key: 'chemistry',
    label: 'রসায়ন',
    detail: '১১ অধ্যায়',
    icon: '⚗️',
    gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
    border: '#DDD6FE',
    textColor: '#5B21B6',
    shadow: 'rgba(139,92,246,0.15)',
    href: '/guide/chemistry',
  },
  {
    key: 'biology',
    label: 'জীববিজ্ঞান',
    detail: '১২ অধ্যায়',
    icon: '🧬',
    gradient: 'linear-gradient(135deg, #DB2777, #EC4899)',
    border: '#FBCFE8',
    textColor: '#9D174D',
    shadow: 'rgba(236,72,153,0.15)',
    href: '/guide/biology',
  },
];

const QUICK_LINKS = [
  { href: '/exams', icon: '📝', label: 'MCQ পরীক্ষা', detail: '৮৪০+ প্রশ্ন', gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)' },
  { href: '/review', icon: '🔄', label: 'SRS রিভিউ', detail: 'স্পেসড রিপিটিশন', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  { href: '/achievements', icon: '🎖️', label: 'অ্যাচিভমেন্ট', detail: 'ব্যাজ সংগ্রহ', gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)' },
  { href: '/leaderboard', icon: '🏆', label: 'লিডারবোর্ড', detail: 'র‍্যাংকিং দেখো', gradient: 'linear-gradient(135deg, #EC4899, #F472B6)' },
];

interface ClassInfo {
  slug: string;
  title: string;
  subject: string;
  chapter: number;
  duration: string;
  youtubeId: string | null;
}

interface ExamInfo {
  id: string;
  title: string;
  subject: string;
  subjectBn: string;
  questionCount: number;
  duration: number;
  totalMarks: number;
}

const SUBJECT_COLORS: Record<string, string> = {
  physics: '#3B82F6',
  chemistry: '#7C3AED',
  biology: '#EC4899',
};

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
};

const SUBJECT_ICONS: Record<string, string> = {
  physics: '⚡',
  chemistry: '🧪',
  biology: '🧬',
};

function ytThumb(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

type ContentMap = Record<string, string>;

export default function DesktopHome({
  classes,
  exams,
  content = {},
  quicklinks = {},
  subjects = {},
}: {
  classes: ClassInfo[];
  exams: ExamInfo[];
  content?: ContentMap;
  quicklinks?: ContentMap;
  subjects?: ContentMap;
}) {
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    '';
  const firstName = displayName ? displayName.split(' ')[0] : '';

  return (
    <div style={{ background: '#F8FAFB' }}>
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* ── Welcome ── */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#134E4A' }}>
            {user
              ? `👋 স্বাগতম, ${firstName || 'শিক্ষার্থী'}!`
              : `👋 ${content.welcome_guest_title || 'বিজ্ঞান দেখো, বিজ্ঞান বোঝো'}`}
          </h1>
          <p className="text-base mt-1" style={{ color: '#5F9EA0' }}>
            {user
              ? (content.welcome_logged_in || 'আজ কী শিখবে? তোমার পড়াশোনা শুরু করো।')
              : (content.welcome_guest_subtitle || 'ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স — NCTB পাঠ্যবইয়ের প্রতিটি অধ্যায়।')}
          </p>
        </div>

        {/* ── Subject Cards ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {SUBJECTS.map((sub) => (
            <Link
              key={sub.key}
              href={sub.href}
              className="rounded-xl p-5 flex items-center gap-4 suttro-transition hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'white', border: `1px solid ${sub.border}` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0"
                style={{ background: sub.gradient, boxShadow: `0 4px 12px ${sub.shadow}` }}
              >
                {sub.icon}
              </div>
              <div>
                <div className="text-base font-semibold" style={{ color: sub.textColor }}>
                  {sub.label}
                </div>
                <div className="text-sm" style={{ color: '#94A3B8' }}>
                  {sub.detail}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── আজকের পড়া & নতুন ক্লাস Row ── */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* আজকের পড়া */}
          <Link
            href="/daily"
            className="rounded-xl p-5 flex items-center gap-4 suttro-transition hover:shadow-lg hover:-translate-y-0.5"
            style={{ background: 'white', border: '1px solid #BFDBFE' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}
            >
              📖
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold" style={{ color: '#1E40AF' }}>
                {content.daily_study_title || 'আজকের পড়া'}
              </div>
              <div className="text-sm" style={{ color: '#60A5FA' }}>
                {content.daily_study_subtitle || 'ক্লাস, MCQ, বাড়ির কাজ'}
              </div>
            </div>
            <span
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)' }}
            >
              {content.start_btn || 'শুরু'}
            </span>
          </Link>

          {/* নতুন ক্লাস */}
          {classes[0] && (
            <Link
              href={`/class/${classes[0].slug}`}
              className="rounded-xl p-5 flex items-center gap-4 suttro-transition hover:shadow-lg hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '1px solid #FDE68A' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}
              >
                ▶
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base font-semibold" style={{ color: '#92400E' }}>
                  {content.new_class_label || 'নতুন ক্লাস!'}
                </div>
                <div className="text-sm truncate" style={{ color: '#B45309' }}>
                  {classes[0].title} — {classes[0].duration}
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* ── Quick Links ── */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl p-4 flex items-center gap-3 suttro-transition hover:shadow-md hover:-translate-y-0.5"
              style={{ background: 'white', border: '1px solid #F0F4F3' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-base flex-shrink-0"
                style={{ background: link.gradient }}
              >
                {link.icon}
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: '#134E4A' }}>
                  {link.label}
                </div>
                <div className="text-xs" style={{ color: '#94A3B8' }}>
                  {link.detail}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── সাম্প্রতিক ক্লাস ── */}
        {classes.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#134E4A' }}>
                {content.recent_classes_title || 'সাম্প্রতিক ক্লাস'}
              </h2>
              <Link
                href="/classes"
                className="text-sm font-medium suttro-transition hover:opacity-80"
                style={{ color: '#0D9488' }}
              >
                {content.all_classes_link || 'সব ক্লাস'} &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {classes.slice(0, 6).map((cls) => {
                const color = SUBJECT_COLORS[cls.subject] || '#0D9488';
                return (
                  <Link
                    key={cls.slug}
                    href={`/class/${cls.slug}`}
                    className="group rounded-xl border overflow-hidden suttro-transition hover:shadow-lg"
                    style={{ borderColor: '#F0F4F3', background: 'white' }}
                  >
                    <div className="h-36 relative overflow-hidden" style={{ background: '#0F172A' }}>
                      {cls.youtubeId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ytThumb(cls.youtubeId)}
                          alt={cls.title}
                          className="w-full h-full object-cover group-hover:scale-105 suttro-transition"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: color + '15' }}>
                          <span className="text-4xl opacity-60">{SUBJECT_ICONS[cls.subject] || '📚'}</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium text-white" style={{ background: color }}>
                        {SUBJECT_LABELS[cls.subject] || cls.subject}
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-xs font-medium text-white bg-black/70">
                        {cls.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold truncate group-hover:text-teal-600 suttro-transition" style={{ color: '#134E4A' }}>
                        {cls.title}
                      </h3>
                      <div className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                        অধ্যায় {cls.chapter} · {cls.duration}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MCQ পরীক্ষা ── */}
        {exams.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: '#134E4A' }}>
                {content.mcq_section_title || 'MCQ পরীক্ষা'}
              </h2>
              <Link
                href="/exams"
                className="text-sm font-medium suttro-transition hover:opacity-80"
                style={{ color: '#0D9488' }}
              >
                {content.all_exams_link || 'সব পরীক্ষা'} &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {exams.slice(0, 6).map((exam) => {
                const color = SUBJECT_COLORS[exam.subject] || '#0D9488';
                return (
                  <Link
                    key={exam.id}
                    href={`/exam/${exam.id}`}
                    className="group rounded-xl border overflow-hidden suttro-transition hover:shadow-lg"
                    style={{ borderColor: '#F0F4F3', background: 'white' }}
                  >
                    <div className="h-1.5" style={{ background: color }} />
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{SUBJECT_ICONS[exam.subject] || '📚'}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ background: color }}>
                          {exam.subjectBn}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold mb-2 group-hover:text-teal-600 suttro-transition" style={{ color: '#134E4A' }}>
                        {exam.title}
                      </h3>
                      <div className="text-xs" style={{ color: '#94A3B8' }}>
                        {exam.questionCount} প্রশ্ন · {exam.duration} মিনিট · {exam.totalMarks} নম্বর
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* ── সিমুলেশন ── */}
        <div className="text-center py-6">
          <Link
            href="/simulations"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold text-white suttro-transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)', boxShadow: '0 4px 14px rgba(13,148,136,0.25)' }}
          >
            🔬 {content.sim_cta || 'সিমুলেশন চালাও'} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
