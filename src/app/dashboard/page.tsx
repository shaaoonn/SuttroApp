'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { calculateLevel, xpForNextLevel } from '@/lib/xp';

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

const EVENT_LABELS: Record<string, string> = {
  exam_started: 'পরীক্ষা শুরু',
  exam_completed: 'পরীক্ষা শেষ',
  class_opened: 'ক্লাস দেখেছ',
  sim_opened: 'সিমুলেশন ব্যবহার',
  cq_viewed: 'সৃজনশীল দেখেছ',
  subscription_activated: 'সাবস্ক্রিপশন সক্রিয়',
};

const EVENT_ICONS: Record<string, string> = {
  exam_started: '📝',
  exam_completed: '✅',
  class_opened: '📹',
  sim_opened: '🔬',
  cq_viewed: '📖',
  subscription_activated: '💎',
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
  if (percentage >= 80) return { label: 'A+', color: '#059669' };
  if (percentage >= 70) return { label: 'A', color: '#2563EB' };
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
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  const fetchAll = useCallback(async () => {
    if (!session?.access_token) return;
    const headers = { Authorization: `Bearer ${session.access_token}` };

    const [dashRes, xpRes, srsRes] = await Promise.all([
      fetch('/api/dashboard', { headers }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/xp', { headers }).then((r) => r.ok ? r.json() : null).catch(() => null),
      fetch('/api/srs', { headers }).then((r) => r.ok ? r.json() : null).catch(() => null),
    ]);

    if (dashRes) setData(dashRes);
    if (xpRes) setXpStats(xpRes);
    if (srsRes) setSrsCount(srsRes.totalDue ?? 0);
    setDataLoading(false);
  }, [session?.access_token]);

  useEffect(() => {
    if (session?.access_token) fetchAll();
    else if (!loading) setDataLoading(false);
  }, [session?.access_token, loading, fetchAll]);

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

  const counts = data?.counts || { exams_taken: 0, classes_watched: 0, sims_viewed: 0, cq_viewed: 0 };
  const totalXP = xpStats?.total_xp ?? 0;
  const level = xpStats?.level ?? calculateLevel(totalXP);
  const streak = xpStats?.current_streak ?? 0;
  const todayXP = xpStats?.todayXP ?? 0;
  const dailyGoal = xpStats?.daily_goal_xp ?? 50;
  const nextLevel = xpForNextLevel(totalXP);

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
              ড্যাশবোর্ড
            </h1>
            <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
              তোমার শেখার অগ্রগতি এক নজরে।
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

        {/* XP & Streak Banner */}
        <div className="rounded-[14px] border p-5 mb-6"
          style={{ background: 'linear-gradient(135deg, #1B6B4A 0%, #0F4A33 100%)', borderColor: 'transparent' }}>
          <div className="flex flex-wrap items-center gap-6">
            {/* Level */}
            <div className="text-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)' }}>
                {level}
              </div>
              <p className="text-xs text-white/70 mt-1">লেভেল</p>
            </div>

            {/* XP Progress */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{totalXP} XP</span>
                <span className="text-xs text-white/60">লেভেল {level + 1} → {nextLevel.needed} XP</span>
              </div>
              <div className="w-full h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${nextLevel.progress}%`, background: '#4ade80' }} />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-white/60">আজ: {todayXP}/{dailyGoal} XP</span>
                {todayXP >= dailyGoal && <span className="text-xs text-green-300">✓ গোল পূরণ!</span>}
              </div>
            </div>

            {/* Streak */}
            <div className="text-center px-4">
              <div className="text-3xl mb-0.5">{streak > 0 ? '🔥' : '❄️'}</div>
              <p className="text-xl font-bold text-white">{streak}</p>
              <p className="text-xs text-white/60">দিন স্ট্রিক</p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Link href="/daily"
            className="rounded-[12px] border p-4 suttro-transition hover:shadow-sm"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}>
            <div className="text-2xl mb-1">🎯</div>
            <p className="text-sm font-bold" style={{ color: 'var(--suttro-deep)' }}>দৈনিক চ্যালেঞ্জ</p>
            <p className="text-xs" style={{ color: 'var(--suttro-muted)' }}>+25-50 XP</p>
          </Link>
          <Link href="/review"
            className="rounded-[12px] border p-4 suttro-transition hover:shadow-sm relative"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}>
            <div className="text-2xl mb-1">🧠</div>
            <p className="text-sm font-bold" style={{ color: 'var(--suttro-deep)' }}>রিভিউ কার্ড</p>
            <p className="text-xs" style={{ color: 'var(--suttro-muted)' }}>
              {srsCount > 0 ? `${srsCount}টি বাকি` : 'সব শেষ!'}
            </p>
            {srsCount > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                style={{ background: '#dc2626' }}>{srsCount > 9 ? '9+' : srsCount}</span>
            )}
          </Link>
          <Link href="/leaderboard"
            className="rounded-[12px] border p-4 suttro-transition hover:shadow-sm"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}>
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-sm font-bold" style={{ color: 'var(--suttro-deep)' }}>লিডারবোর্ড</p>
            <p className="text-xs" style={{ color: 'var(--suttro-muted)' }}>র‍্যাংকিং দেখো</p>
          </Link>
          <Link href="/achievements"
            className="rounded-[12px] border p-4 suttro-transition hover:shadow-sm"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}>
            <div className="text-2xl mb-1">🎖️</div>
            <p className="text-sm font-bold" style={{ color: 'var(--suttro-deep)' }}>অ্যাচিভমেন্ট</p>
            <p className="text-xs" style={{ color: 'var(--suttro-muted)' }}>ব্যাজ সংগ্রহ</p>
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'পরীক্ষা দিয়েছ', value: dataLoading ? '...' : String(counts.exams_taken), icon: '📝' },
            { label: 'গড় স্কোর', value: dataLoading ? '...' : `${data?.avgScore || 0}%`, icon: '📊' },
            { label: 'ক্লাস দেখেছ', value: dataLoading ? '...' : String(counts.classes_watched), icon: '📹' },
            { label: 'সিমুলেশন', value: dataLoading ? '...' : String(counts.sims_viewed), icon: '🔬' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[12px] border p-4 text-center"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}>
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold mb-0.5" style={{ color: 'var(--suttro-primary)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--suttro-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Exam History */}
          <div className="rounded-[14px] border p-6"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--suttro-deep)' }}>
              পরীক্ষার ইতিহাস
            </h2>
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2 animate-pulse">⏳</div>
              </div>
            ) : data?.examAttempts && data.examAttempts.length > 0 ? (
              <div className="space-y-2">
                {data.examAttempts.map((attempt) => {
                  const pct = attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0;
                  const grade = getGrade(pct);
                  return (
                    <Link key={attempt.id} href={`/exam/${attempt.examPaperId}`}
                      className="flex items-center justify-between p-3 rounded-[10px] hover:bg-black/5 suttro-transition border"
                      style={{ borderColor: 'var(--suttro-border)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--suttro-text)' }}>
                          {attempt.examTitle}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--suttro-muted)' }}>
                          {attempt.correct} সঠিক, {attempt.wrong} ভুল — {formatDuration(attempt.duration)}
                        </div>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <div className="text-base font-bold" style={{ color: grade.color }}>
                          {attempt.score.toFixed(1)}/{attempt.totalMarks}
                        </div>
                        <div className="text-xs" style={{ color: grade.color }}>{grade.label}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">📝</div>
                <p className="text-sm mb-3" style={{ color: 'var(--suttro-muted)' }}>এখনো কোনো পরীক্ষা দাওনি।</p>
                <Link href="/exams" className="inline-block px-5 py-2 rounded-[10px] text-sm font-medium text-white"
                  style={{ background: 'var(--suttro-primary)' }}>
                  পরীক্ষা দাও &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-[14px] border p-6"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--suttro-deep)' }}>
              সম্প্রতি কার্যকলাপ
            </h2>
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2 animate-pulse">⏳</div>
              </div>
            ) : data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {data.recentActivity.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-[10px]"
                    style={{ background: 'var(--suttro-sky)' }}>
                    <span className="text-lg shrink-0">{EVENT_ICONS[item.eventType] || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: 'var(--suttro-text)' }}>
                        {EVENT_LABELS[item.eventType] || item.eventType}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--suttro-muted)' }}>{timeAgo(item.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">🎯</div>
                <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                  কোনো কার্যকলাপ নেই। পরীক্ষা দাও বা ক্লাস দেখো!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: '/exams', icon: '📝', label: 'পরীক্ষা' },
            { href: '/simulations', icon: '🔬', label: 'সিমুলেশন' },
            { href: '/classes', icon: '📹', label: 'ক্লাস আর্কাইভ' },
            { href: '/pricing', icon: '💎', label: 'প্রিমিয়াম' },
          ].map((link) => (
            <Link key={link.href} href={link.href}
              className="rounded-[12px] p-4 text-center suttro-transition hover:opacity-80"
              style={{ background: 'var(--suttro-sky)' }}>
              <div className="text-xl mb-1">{link.icon}</div>
              <div className="text-sm font-medium" style={{ color: 'var(--suttro-deep)' }}>{link.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
