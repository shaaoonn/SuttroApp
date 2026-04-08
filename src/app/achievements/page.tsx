'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface Badge {
  id: string;
  name_bn: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  earned: boolean;
}

export default function AchievementsPage() {
  const { session } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [earnedCount, setEarnedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    fetch('/api/badges', { headers })
      .then((r) => r.json())
      .then((data) => {
        setBadges(data.badges ?? []);
        setEarnedCount(data.earnedCount ?? 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const categories = [
    { key: 'milestone', label: 'মাইলস্টোন' },
    { key: 'streak', label: 'স্ট্রিক' },
    { key: 'mastery', label: 'মাস্টারি' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
        <div className="animate-spin h-8 w-8 border-3 rounded-full"
          style={{ borderColor: 'var(--suttro-primary) transparent transparent transparent' }} />
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--suttro-surface)', minHeight: '70vh' }}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
          🎖️ অ্যাচিভমেন্ট
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--suttro-muted)' }}>
          {earnedCount}/{badges.length} ব্যাজ অর্জিত
        </p>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full mb-8" style={{ background: 'var(--suttro-border)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${badges.length > 0 ? (earnedCount / badges.length) * 100 : 0}%`,
              background: 'linear-gradient(90deg, var(--suttro-primary), var(--suttro-accent))',
            }}
          />
        </div>

        {categories.map(({ key, label }) => {
          const catBadges = badges.filter((b) => b.category === key);
          if (catBadges.length === 0) return null;

          return (
            <div key={key} className="mb-8">
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--suttro-deep)' }}>
                {label}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {catBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`rounded-[12px] border p-4 text-center transition-all ${
                      badge.earned ? '' : 'opacity-40 grayscale'
                    }`}
                    style={{
                      background: badge.earned ? 'var(--suttro-white)' : 'var(--suttro-surface)',
                      borderColor: badge.earned ? 'var(--suttro-primary)' : 'var(--suttro-border)',
                    }}
                  >
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
                      {badge.name_bn}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--suttro-muted)' }}>
                      {badge.description}
                    </p>
                    {badge.xp_reward > 0 && (
                      <p className="text-xs mt-1 font-medium" style={{ color: 'var(--suttro-primary)' }}>
                        +{badge.xp_reward} XP
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
