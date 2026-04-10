'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { calculateLevel, xpForNextLevel } from '@/lib/xp';

// ─────────────────────────────────────────────
// Dashboard — Profile & Progress
// Matches the 10-page design reference (Page 7)
// ─────────────────────────────────────────────

interface ExamAttempt {
  id: string;
  examPaperId: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  correct: number;
  wrong: number;
  skipped: number;
  duration: number;
  completedAt: string;
}

interface ActivityItem {
  eventType: string;
  contentType: string;
  contentId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

interface DashboardData {
  counts: {
    exams_taken: number;
    classes_watched: number;
    sims_viewed: number;
    cq_viewed: number;
  };
  avgScore: number;
  examAttempts: ExamAttempt[];
  recentActivity: ActivityItem[];
}

interface XPStats {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  daily_goal_xp: number;
  todayXP: number;
}

interface SubjectProgress {
  subjectId: string;
  avgMastery: number;
  totalAttempted: number;
  totalCorrect: number;
  chaptersStudied: number;
}

const SUBJECT_META: Record<
  string,
  { bn: string; icon: string; color: string; light: string; bg: string; border: string; textColor: string }
> = {
  physics: {
    bn: 'পদার্থবিজ্ঞান',
    icon: '⚡',
    color: '#3B82F6',
    light: '#60A5FA',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    textColor: '#1E40AF',
  },
  chemistry: {
    bn: 'রসায়ন',
    icon: '🧪',
    color: '#7C3AED',
    light: '#A78BFA',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    textColor: '#5B21B6',
  },
  biology: {
    bn: 'জীববিজ্ঞান',
    icon: '🧬',
    color: '#EC4899',
    light: '#F472B6',
    bg: '#FDF2F8',
    border: '#FBCFE8',
    textColor: '#9D174D',
  },
  math: {
    bn: 'গণিত',
    icon: '📐',
    color: '#DC2626',
    light: '#F87171',
    bg: '#FEF2F2',
    border: '#FECACA',
    textColor: '#991B1B',
  },
  'higher-math': {
    bn: 'উচ্চতর গণিত',
    icon: '📊',
    color: '#EA580C',
    light: '#FB923C',
    bg: '#FFF7ED',
    border: '#FED7AA',
    textColor: '#9A3412',
  },
};

const EVENT_LABELS: Record<string, string> = {
  exam_started: 'পরীক্ষা শুরু',
  exam_completed: 'পরীক্ষা শেষ',
  class_opened: 'ক্লাস দেখেছ',
  sim_opened: 'সিমুলেশন ব্যবহার',
  cq_viewed: 'সৃজনশীল দেখেছ',
  subscription_activated: 'সাবস্ক্রিপশন সক্রিয়',
  daily_challenge_completed: 'দৈনিক চ্যালেঞ্জ সম্পন্ন',
};

const EVENT_ICONS: Record<string, string> = {
  exam_started: '📝',
  exam_completed: '✅',
  class_opened: '📹',
  sim_opened: '🔬',
  cq_viewed: '📖',
  subscription_activated: '💎',
  daily_challenge_completed: '🎯',
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'এইমাত্র';
  if (minutes < 60) return `${minutes} মিনিট আগে`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} দিন আগে`;
  return new Date(dateStr).toLocaleDateString('bn-BD');
}

function getGrade(percentage: number): { label: string; color: string } {
  if (percentage >= 80) return { label: 'A+', color: '#10B981' };
  if (percentage >= 70) return { label: 'A', color: '#3B82F6' };
  if (percentage >= 60) return { label: 'A-', color: '#7C3AED' };
  if (percentage >= 50) return { label: 'B', color: '#EA580C' };
  if (percentage >= 40) return { label: 'C', color: '#DC2626' };
  return { label: 'F', color: '#DC2626' };
}

export default function DashboardPage() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [xpStats, setXpStats] = useState<XPStats | null>(null);
  const [srsCount, setSrsCount] = useState(0);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [classLevel, setClassLevel] = useState<number | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  const fetchAll = useCallback(async () => {
    if (!session?.access_token) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };

    const [dashRes, xpRes, srsRes, progressRes, profileRes] = await Promise.all([
      fetch('/api/dashboard', { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/xp', { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/srs', { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/chapter-progress', { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch('/api/profile', { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]);

    if (dashRes) setData(dashRes);
    if (xpRes) setXpStats(xpRes);
    if (srsRes) setSrsCount(srsRes.totalDue ?? 0);
    if (progressRes) setSubjectProgress(progressRes.subjects ?? []);
    if (profileRes) setClassLevel(profileRes.class_level ?? 9);
    setDataLoading(false);
  }, [session?.access_token]);

  useEffect(() => {
    if (session?.access_token) fetchAll();
    else if (!loading) setDataLoading(false);
  }, [session?.access_token, loading, fetchAll]);

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: '#F8FAFB' }}
      >
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">⏳</div>
          <p style={{ color: '#94A3B8' }}>লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    'শিক্ষার্থী';
  const initial = displayName.charAt(0);
  const avatarUrl =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    '';
  const totalXP = xpStats?.total_xp ?? 0;
  const level = xpStats?.level ?? calculateLevel(totalXP);
  const streak = xpStats?.current_streak ?? 0;
  const nextLevel = xpForNextLevel(totalXP);
  const badgeCount = 0; // placeholder

  return (
    <div style={{ background: '#F8FAFB' }}>
      {/* ── Profile Header ── */}
      <div
        className="text-center"
        style={{
          background: 'linear-gradient(180deg, #F0FDFA, #F8FAFB)',
          padding: '20px 16px 12px',
        }}
      >
        {/* Avatar */}
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="w-14 h-14 mx-auto mb-2 rounded-full object-cover"
            style={{
              border: '2.5px solid #0D9488',
              boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center text-xl text-white font-bold"
            style={{
              background: 'linear-gradient(135deg, #0D9488, #2DD4BF)',
              boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
            }}
          >
            {initial}
          </div>
        )}
        <div
          className="text-base font-bold"
          style={{ color: '#134E4A' }}
        >
          {displayName}
        </div>
        <div className="text-xs mb-3" style={{ color: '#5F9EA0' }}>
          {classLevel ? (classLevel === 10 ? 'ক্লাস ১০' : 'ক্লাস ৯') : 'ক্লাস ৯-১০'}
        </div>

        {/* Stat Cards Row */}
        <div className="flex gap-2 justify-center mb-2">
          {/* Level */}
          <div
            className="rounded-[10px] px-3.5 py-2 text-center"
            style={{
              background: 'white',
              border: '1px solid #CCFBF1',
            }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: '#0D9488' }}
            >
              Level {level}
            </div>
            <div className="text-[10px]" style={{ color: '#5F9EA0' }}>
              {totalXP}/{nextLevel.needed} XP
            </div>
          </div>
          {/* Streak */}
          <div
            className="rounded-[10px] px-3.5 py-2 text-center"
            style={{
              background: 'white',
              border: '1px solid #FDE68A',
            }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: '#F59E0B' }}
            >
              {streak}
            </div>
            <div className="text-[10px]" style={{ color: '#5F9EA0' }}>
              🔥 Day Streak
            </div>
          </div>
          {/* Badges */}
          <div
            className="rounded-[10px] px-3.5 py-2 text-center"
            style={{
              background: 'white',
              border: '1px solid #F0F4F3',
            }}
          >
            <div
              className="text-lg font-bold"
              style={{ color: '#3B82F6' }}
            >
              {badgeCount}
            </div>
            <div className="text-[10px]" style={{ color: '#5F9EA0' }}>
              ব্যাজ
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 pb-6 flex flex-col gap-3">
        {/* XP Progress Card */}
        <div
          className="rounded-xl p-3"
          style={{ background: 'white', border: '1px solid #CCFBF1' }}
        >
          <div className="flex justify-between items-center mb-1.5">
            <span
              className="text-sm font-semibold"
              style={{ color: '#134E4A' }}
            >
              Level {level} → Level {level + 1}
            </span>
            <span
              className="text-[13px] font-medium"
              style={{ color: '#2DD4BF' }}
            >
              {totalXP}/{nextLevel.needed} XP
            </span>
          </div>
          <div
            className="h-1.5 rounded-full"
            style={{ background: '#F0FDFA' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${nextLevel.progress}%`,
                background: 'linear-gradient(90deg, #0D9488, #2DD4BF)',
                boxShadow: '0 1px 6px rgba(13,148,136,0.25)',
              }}
            />
          </div>
        </div>

        {/* Subject Progress */}
        <div className="flex flex-col gap-1.5">
          <div
            className="text-sm font-semibold px-1"
            style={{ color: '#134E4A' }}
          >
            বিষয়ভিত্তিক প্রগ্রেস
          </div>

          {subjectProgress.length > 0 ? (
            subjectProgress.map((sp) => {
              const meta = SUBJECT_META[sp.subjectId] || {
                bn: sp.subjectId,
                icon: '📚',
                color: '#0D9488',
                light: '#14B8A6',
                bg: '#F0FDFA',
                border: '#CCFBF1',
                textColor: '#134E4A',
              };
              return (
                <Link
                  key={sp.subjectId}
                  href={`/guide/${sp.subjectId}`}
                  className="rounded-xl p-3 suttro-transition active:scale-[0.98]"
                  style={{
                    background: 'white',
                    border: `1px solid ${meta.border}`,
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: meta.textColor }}
                    >
                      {meta.bn}
                    </span>
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: meta.color }}
                    >
                      {sp.avgMastery}%
                    </span>
                  </div>
                  <div
                    className="h-[5px] rounded-full"
                    style={{ background: meta.bg }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(sp.avgMastery, 100)}%`,
                        background: `linear-gradient(90deg, ${meta.color}, ${meta.light})`,
                      }}
                    />
                  </div>
                </Link>
              );
            })
          ) : (
            /* Default subject cards when no progress data */
            <>
              {(['physics', 'chemistry', 'biology'] as const).map((subjectKey) => {
                const meta = SUBJECT_META[subjectKey];
                return (
                  <Link
                    key={subjectKey}
                    href={`/guide/${subjectKey}`}
                    className="rounded-xl p-3 suttro-transition active:scale-[0.98]"
                    style={{
                      background: 'white',
                      border: `1px solid ${meta.border}`,
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: meta.textColor }}
                      >
                        {meta.bn}
                      </span>
                      <span
                        className="text-[13px] font-medium"
                        style={{ color: '#94A3B8' }}
                      >
                        0%
                      </span>
                    </div>
                    <div
                      className="h-[5px] rounded-full"
                      style={{ background: meta.bg }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </Link>
                );
              })}
            </>
          )}
        </div>

        {/* Earned Badges */}
        <div className="flex flex-col gap-1.5">
          <div
            className="text-sm font-semibold px-1"
            style={{ color: '#134E4A' }}
          >
            অর্জিত ব্যাজ
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* Placeholder badges */}
            {[
              { gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)', icon: '🏆', shadow: 'rgba(245,158,11,0.2)' },
              { gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', icon: '⚡', shadow: 'rgba(59,130,246,0.2)' },
              { gradient: 'linear-gradient(135deg, #10B981, #34D399)', icon: '✓', shadow: 'rgba(16,185,129,0.2)' },
              { gradient: 'linear-gradient(135deg, #7C3AED, #A78BFA)', icon: '★', shadow: 'rgba(139,92,246,0.2)' },
            ].map((badge, i) => (
              <div
                key={i}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: badge.gradient,
                  boxShadow: `0 3px 10px ${badge.shadow}`,
                }}
              >
                {badge.icon}
              </div>
            ))}
            <Link
              href="/achievements"
              className="w-11 h-11 rounded-xl flex items-center justify-center text-base"
              style={{
                background: '#E2E8F0',
                color: '#94A3B8',
              }}
            >
              ?
            </Link>
          </div>
        </div>

        {/* ── Desktop-only: Exam History & Activity ── */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 mt-4">
          {/* Exam History */}
          <div
            className="rounded-xl border p-6"
            style={{ borderColor: '#CCFBF1', background: 'white' }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: '#134E4A' }}
            >
              পরীক্ষার ইতিহাস
            </h2>
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2 animate-pulse">⏳</div>
              </div>
            ) : data?.examAttempts && data.examAttempts.length > 0 ? (
              <div className="space-y-2">
                {data.examAttempts.map((attempt) => {
                  const pct =
                    attempt.totalMarks > 0
                      ? Math.round(
                          (attempt.score / attempt.totalMarks) * 100
                        )
                      : 0;
                  const grade = getGrade(pct);
                  return (
                    <Link
                      key={attempt.id}
                      href={`/exam/${attempt.examPaperId}`}
                      className="flex items-center justify-between p-3 rounded-[10px] hover:bg-black/5 suttro-transition border"
                      style={{ borderColor: '#F0F4F3' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: '#134E4A' }}
                        >
                          {attempt.examTitle}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: '#94A3B8' }}
                        >
                          {attempt.correct} সঠিক, {attempt.wrong} ভুল —{' '}
                          {formatDuration(attempt.duration)}
                        </div>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <div
                          className="text-base font-bold"
                          style={{ color: grade.color }}
                        >
                          {attempt.score.toFixed(1)}/{attempt.totalMarks}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: grade.color }}
                        >
                          {grade.label}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">📝</div>
                <p
                  className="text-sm mb-3"
                  style={{ color: '#94A3B8' }}
                >
                  এখনো কোনো পরীক্ষা দাওনি।
                </p>
                <Link
                  href="/exams"
                  className="inline-block px-5 py-2 rounded-[10px] text-sm font-medium text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #0D9488, #14B8A6)',
                  }}
                >
                  পরীক্ষা দাও &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div
            className="rounded-xl border p-6"
            style={{ borderColor: '#CCFBF1', background: 'white' }}
          >
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: '#134E4A' }}
            >
              সম্প্রতি কার্যকলাপ
            </h2>
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2 animate-pulse">⏳</div>
              </div>
            ) : data?.recentActivity &&
              data.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {data.recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-[10px]"
                    style={{ background: '#F0FDFA' }}
                  >
                    <span className="text-lg shrink-0">
                      {EVENT_ICONS[item.eventType] || '📌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium truncate"
                        style={{ color: '#134E4A' }}
                      >
                        {EVENT_LABELS[item.eventType] ||
                          item.eventType}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: '#94A3B8' }}
                      >
                        {timeAgo(item.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">🎯</div>
                <p className="text-sm" style={{ color: '#94A3B8' }}>
                  কোনো কার্যকলাপ নেই। পরীক্ষা দাও বা ক্লাস দেখো!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Links */}
        <div className="flex flex-col gap-1.5 mt-2">
          <Link
            href="/profile"
            className="rounded-xl p-3 flex items-center gap-3 suttro-transition active:scale-[0.98]"
            style={{ background: 'white', border: '1px solid #F0F4F3' }}
          >
            <span className="text-base">⚙️</span>
            <span
              className="text-sm font-medium flex-1"
              style={{ color: '#134E4A' }}
            >
              সেটিংস
            </span>
            <span style={{ color: '#0D9488' }}>➤</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="rounded-xl p-3 text-center text-sm font-medium suttro-transition active:scale-[0.98]"
            style={{ color: '#EF4444' }}
          >
            লগ আউট
          </button>
        </div>
      </div>
    </div>
  );
}
