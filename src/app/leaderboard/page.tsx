'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  weeklyXP?: number;
  totalXP: number;
  level: number;
  streak: number;
}

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
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div style={{ background: 'var(--suttro-surface)', minHeight: '70vh' }}>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
          🏆 লিডারবোর্ড
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--suttro-muted)' }}>
          সবচেয়ে অ্যাক্টিভ শিক্ষার্থীরা
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['weekly', 'allTime'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={tab === t
                ? { background: 'var(--suttro-primary)', color: 'white' }
                : { background: 'var(--suttro-white)', color: 'var(--suttro-muted)', border: '1px solid var(--suttro-border)' }
              }
            >
              {t === 'weekly' ? 'এই সপ্তাহ' : 'সর্বকালীন'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-8 w-8 border-3 rounded-full mx-auto"
              style={{ borderColor: 'var(--suttro-primary) transparent transparent transparent' }} />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p style={{ color: 'var(--suttro-muted)' }}>
              এখনো কোনো ডেটা নেই। পরীক্ষা দিয়ে XP অর্জন করো!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className="flex items-center gap-4 p-4 rounded-[12px] border"
                style={{
                  background: entry.rank <= 3 ? '#fffbeb' : 'var(--suttro-white)',
                  borderColor: entry.rank <= 3 ? '#fbbf24' : 'var(--suttro-border)',
                }}
              >
                <span className="text-2xl w-10 text-center">
                  {entry.rank <= 3 ? medals[entry.rank - 1] : (
                    <span className="text-base font-bold" style={{ color: 'var(--suttro-muted)' }}>
                      {entry.rank}
                    </span>
                  )}
                </span>

                <div className="flex-1">
                  <p className="font-medium" style={{ color: 'var(--suttro-deep)' }}>
                    {entry.name}
                  </p>
                  <div className="flex gap-3 text-xs" style={{ color: 'var(--suttro-muted)' }}>
                    <span>লেভেল {entry.level}</span>
                    {entry.streak > 0 && <span>🔥 {entry.streak} দিন</span>}
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold" style={{ color: 'var(--suttro-primary)' }}>
                    {tab === 'weekly' ? entry.weeklyXP : entry.totalXP} XP
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
