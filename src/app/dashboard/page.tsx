'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

// ─────────────────────────────────────────────
// Dashboard — User learning progress
// Protected: redirects to /login if not logged in
// Fetches real data from /api/dashboard
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

const EVENT_LABELS: Record<string, string> = {
  exam_started: 'পরীক্ষা শুরু',
  exam_completed: 'পরীক্ষা শেষ',
  class_opened: 'ক্লাস দেখেছ',
  sim_opened: 'সিমুলেশন ব্যবহার',
  cq_viewed: 'সৃজনশীল দেখেছ',
};

const EVENT_ICONS: Record<string, string> = {
  exam_started: '📝',
  exam_completed: '✅',
  class_opened: '📹',
  sim_opened: '🔬',
  cq_viewed: '📖',
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
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const fetchDashboard = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Silent fail
    } finally {
      setDataLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (session?.access_token) {
      fetchDashboard();
    } else if (!loading) {
      setDataLoading(false);
    }
  }, [session?.access_token, loading, fetchDashboard]);

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

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
              ড্যাশবোর্ড
            </h1>
            <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
              {user.phone ? `${user.phone} — ` : ''}তোমার শেখার অগ্রগতি এক নজরে।
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-5 py-2.5 rounded-[10px] text-base font-medium border suttro-transition hover:bg-black/5"
            style={{ borderColor: 'var(--suttro-border)', color: 'var(--suttro-muted)' }}
          >
            লগ আউট
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'পরীক্ষা দিয়েছ', value: dataLoading ? '...' : String(counts.exams_taken), icon: '📝' },
            { label: 'গড় স্কোর', value: dataLoading ? '...' : `${data?.avgScore || 0}%`, icon: '📊' },
            { label: 'ক্লাস দেখেছ', value: dataLoading ? '...' : String(counts.classes_watched), icon: '📹' },
            { label: 'সিমুলেশন', value: dataLoading ? '...' : String(counts.sims_viewed), icon: '🔬' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-[14px] border p-5 text-center"
              style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--suttro-primary)' }}
              >
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Exam History */}
          <div
            className="rounded-[14px] border p-6"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--suttro-deep)' }}>
              পরীক্ষার ইতিহাস
            </h2>
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2 animate-pulse">⏳</div>
                <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>লোড হচ্ছে...</p>
              </div>
            ) : data?.examAttempts && data.examAttempts.length > 0 ? (
              <div className="space-y-3">
                {data.examAttempts.map((attempt) => {
                  const pct = attempt.totalMarks > 0
                    ? Math.round((attempt.score / attempt.totalMarks) * 100)
                    : 0;
                  const grade = getGrade(pct);
                  return (
                    <Link
                      key={attempt.id}
                      href={`/exam/${attempt.examPaperId}`}
                      className="flex items-center justify-between p-3 rounded-[10px] hover:bg-black/5 suttro-transition border"
                      style={{ borderColor: 'var(--suttro-border)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-medium truncate" style={{ color: 'var(--suttro-text)' }}>
                          {attempt.examTitle}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                          {attempt.correct} সঠিক, {attempt.wrong} ভুল — {formatDuration(attempt.duration)}
                        </div>
                      </div>
                      <div className="text-right ml-3 shrink-0">
                        <div className="text-lg font-bold" style={{ color: grade.color }}>
                          {attempt.score.toFixed(1)}/{attempt.totalMarks}
                        </div>
                        <div className="text-xs font-medium" style={{ color: grade.color }}>
                          {grade.label} ({pct}%)
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">📝</div>
                <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                  এখনো কোনো পরীক্ষা দাওনি।
                </p>
                <Link
                  href="/exams"
                  className="inline-block mt-3 px-5 py-2.5 rounded-[10px] text-base font-medium text-white suttro-transition hover:opacity-90"
                  style={{ background: 'var(--suttro-primary)' }}
                >
                  পরীক্ষা দাও &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div
            className="rounded-[14px] border p-6"
            style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--suttro-deep)' }}>
              সম্প্রতি কার্যকলাপ
            </h2>
            {dataLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl mb-2 animate-pulse">⏳</div>
                <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>লোড হচ্ছে...</p>
              </div>
            ) : data?.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-[10px]"
                    style={{ background: 'var(--suttro-sky)' }}
                  >
                    <span className="text-xl shrink-0">
                      {EVENT_ICONS[item.eventType] || '📌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-medium truncate" style={{ color: 'var(--suttro-text)' }}>
                        {EVENT_LABELS[item.eventType] || item.eventType}
                      </div>
                      <div className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
                        {timeAgo(item.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-3xl mb-3">🎯</div>
                <p className="text-base" style={{ color: 'var(--suttro-muted)' }}>
                  কোনো কার্যকলাপ নেই। পরীক্ষা দাও বা ক্লাস দেখো!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/exams"
            className="rounded-[14px] p-5 text-center suttro-transition hover:opacity-80"
            style={{ background: 'var(--suttro-sky)' }}
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="text-base font-medium" style={{ color: 'var(--suttro-deep)' }}>
              পরীক্ষা
            </div>
          </Link>
          <Link
            href="/simulations"
            className="rounded-[14px] p-5 text-center suttro-transition hover:opacity-80"
            style={{ background: 'var(--suttro-sky)' }}
          >
            <div className="text-2xl mb-2">🔬</div>
            <div className="text-base font-medium" style={{ color: 'var(--suttro-deep)' }}>
              সিমুলেশন
            </div>
          </Link>
          <Link
            href="/classes"
            className="rounded-[14px] p-5 text-center suttro-transition hover:opacity-80"
            style={{ background: 'var(--suttro-sky)' }}
          >
            <div className="text-2xl mb-2">📹</div>
            <div className="text-base font-medium" style={{ color: 'var(--suttro-deep)' }}>
              ক্লাস আর্কাইভ
            </div>
          </Link>
          <Link
            href="/pricing"
            className="rounded-[14px] p-5 text-center suttro-transition hover:opacity-80"
            style={{ background: 'var(--suttro-sky)' }}
          >
            <div className="text-2xl mb-2">💎</div>
            <div className="text-base font-medium" style={{ color: 'var(--suttro-deep)' }}>
              প্রিমিয়াম
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
