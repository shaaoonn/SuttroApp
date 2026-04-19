'use client';

import { useState, useEffect } from 'react';
import { SkeletonList } from '@/components/native/Skeleton';

// ─────────────────────────────────────────────
// Leaderboard - Top-3 podium + list
// Design reference Page 9
// ─────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number;
  name: string;
  weeklyXP?: number;
  totalXP: number;
  level: number;
  streak: number;
}

const AVATAR_COLORS = [
  { bg: '#EFF6FF', color: '#3B82F6' },
  { bg: '#F5F3FF', color: '#7C3AED' },
  { bg: '#FDF2F8', color: '#EC4899' },
  { bg: '#F0FDFA', color: '#0D9488' },
  { bg: '#FFFBEB', color: '#F59E0B' },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'weekly' | 'allTime'>('weekly');
  const [weekly, setWeekly] = useState<LeaderboardEntry[]>([]);
  const [allTime, setAllTime] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((r) => r.json())
      .then((data) => {
        setWeekly(data.weekly ?? []);
        setAllTime(data.allTime ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const entries = tab === 'weekly' ? weekly : allTime;
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  const getXP = (entry: LeaderboardEntry) =>
    tab === 'weekly' ? (entry.weeklyXP ?? entry.totalXP) : entry.totalXP;

  return (
    <div style={{ background: '#F8FAFB', minHeight: '70vh' }}>
      {/* Tab Badges (inside the page, below AppBar) */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: 'white', borderBottom: '1px solid #F0F4F3' }}
      >
        <div className="flex-1" />
        <div className="flex gap-1">
          <button
            onClick={() => setTab('weekly')}
            className="px-3 py-1 rounded-full text-xs font-semibold suttro-transition"
            style={
              tab === 'weekly'
                ? {
                    background: '#F0FDFA',
                    color: '#0D9488',
                    border: '1px solid #CCFBF1',
                  }
                : {
                    background: '#F8FAFB',
                    color: '#94A3B8',
                  }
            }
          >
            সাপ্তাহিক
          </button>
          <button
            onClick={() => setTab('allTime')}
            className="px-3 py-1 rounded-full text-xs font-semibold suttro-transition"
            style={
              tab === 'allTime'
                ? {
                    background: '#F0FDFA',
                    color: '#0D9488',
                    border: '1px solid #CCFBF1',
                  }
                : {
                    background: '#F8FAFB',
                    color: '#94A3B8',
                  }
            }
          >
            সর্বকালীন
          </button>
        </div>
      </div>

      {loading ? (
        <div className="px-4 py-6">
          <SkeletonList count={6} />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📊</p>
          <p style={{ color: '#94A3B8' }}>
            এখনো কোনো ডেটা নেই। পরীক্ষা দিয়ে XP অর্জন করো!
          </p>
        </div>
      ) : (
        <>
          {/* ── Top 3 Podium ── */}
          {top3.length >= 3 && (
            <div
              className="flex justify-center items-end gap-3 py-4 px-4"
              style={{
                background:
                  'linear-gradient(160deg, #F0FDFA, #FFFBEB)',
              }}
            >
              {/* 2nd Place */}
              <div className="text-center">
                <div
                  className="w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: '#E2E8F0',
                    color: '#94A3B8',
                  }}
                >
                  {top3[1].name.charAt(0)}
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: '#134E4A' }}
                >
                  {top3[1].name.split(' ')[0]}
                </div>
                <div className="text-[11px]" style={{ color: '#5F9EA0' }}>
                  {getXP(top3[1])} XP
                </div>
                <div className="text-base mt-0.5">🥈</div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div
                  className="w-[52px] h-[52px] mx-auto mb-1 rounded-full flex items-center justify-center text-lg font-bold text-white"
                  style={{
                    background:
                      'linear-gradient(135deg, #F59E0B, #FBBF24)',
                    boxShadow:
                      '0 4px 14px rgba(245,158,11,0.3)',
                  }}
                >
                  {top3[0].name.charAt(0)}
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: '#134E4A' }}
                >
                  {top3[0].name.split(' ')[0]}
                </div>
                <div
                  className="text-xs font-medium"
                  style={{ color: '#F59E0B' }}
                >
                  {getXP(top3[0])} XP
                </div>
                <div className="text-xl mt-0.5">🏆</div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div
                  className="w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: '#E2E8F0',
                    color: '#94A3B8',
                  }}
                >
                  {top3[2].name.charAt(0)}
                </div>
                <div
                  className="text-xs font-semibold"
                  style={{ color: '#134E4A' }}
                >
                  {top3[2].name.split(' ')[0]}
                </div>
                <div className="text-[11px]" style={{ color: '#5F9EA0' }}>
                  {getXP(top3[2])} XP
                </div>
                <div className="text-base mt-0.5">🥉</div>
              </div>
            </div>
          )}

          {/* Podium fallback for < 3 entries */}
          {top3.length > 0 && top3.length < 3 && (
            <div
              className="text-center py-6 px-4"
              style={{
                background:
                  'linear-gradient(160deg, #F0FDFA, #FFFBEB)',
              }}
            >
              {top3.map((entry, i) => (
                <div key={entry.rank} className="inline-block mx-3 text-center">
                  <div
                    className="w-12 h-12 mx-auto mb-1 rounded-full flex items-center justify-center text-base font-bold text-white"
                    style={{
                      background:
                        i === 0
                          ? 'linear-gradient(135deg, #F59E0B, #FBBF24)'
                          : '#E2E8F0',
                      color: i === 0 ? '#fff' : '#94A3B8',
                    }}
                  >
                    {entry.name.charAt(0)}
                  </div>
                  <div
                    className="text-xs font-semibold"
                    style={{ color: '#134E4A' }}
                  >
                    {entry.name.split(' ')[0]}
                  </div>
                  <div className="text-xs" style={{ color: '#5F9EA0' }}>
                    {getXP(entry)} XP
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Rest of the List ── */}
          <div className="px-4 py-2 flex flex-col gap-1">
            {rest.map((entry) => {
              const avatarStyle =
                AVATAR_COLORS[
                  (entry.rank - 1) % AVATAR_COLORS.length
                ];
              const isMe = false; // TODO: highlight current user

              return (
                <div
                  key={entry.rank}
                  className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl"
                  style={
                    isMe
                      ? {
                          background: '#F0FDFA',
                          border: '1px solid #CCFBF1',
                        }
                      : {
                          background: 'white',
                          border: '1px solid #F0F4F3',
                        }
                  }
                >
                  <span
                    className="text-xs font-bold w-4 text-center"
                    style={{ color: isMe ? '#0D9488' : '#94A3B8' }}
                  >
                    {entry.rank}
                  </span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: avatarStyle.bg,
                      color: avatarStyle.color,
                    }}
                  >
                    {entry.name.charAt(0)}
                  </div>
                  <div
                    className="flex-1 text-sm font-medium"
                    style={{ color: isMe ? '#0D9488' : '#134E4A' }}
                  >
                    {entry.name}
                  </div>
                  <div
                    className="text-xs font-mono"
                    style={{ color: isMe ? '#0D9488' : '#5F9EA0' }}
                  >
                    {getXP(entry)} XP
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
