'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// Onboarding — Class selection + Name setup
// Shown after first login/signup
// Google users get auto-filled name
// Phone users must enter name
// ─────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState<9 | 10>(9);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Check if onboarding is already done
  useEffect(() => {
    if (authLoading) return;

    // Not logged in — redirect to login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Check localStorage
    const done = localStorage.getItem('suttro_onboarding_done');
    if (done) {
      router.replace('/');
      return;
    }

    // Pre-fill name from Google metadata
    const meta = user.user_metadata;
    const googleName = meta?.full_name || meta?.name || '';
    if (googleName) setName(googleName);

    setChecking(false);
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('তোমার নাম লেখো');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          class_level: classLevel,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'প্রোফাইল আপডেট করা যায়নি');
      }

      // Mark onboarding as done
      localStorage.setItem('suttro_onboarding_done', 'true');

      // Go to home
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'কিছু সমস্যা হয়েছে');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || checking) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: '#F0FDFA' }}
      >
        <div className="flex items-center gap-1.5">
          <span className="block w-2 h-2 rounded-full animate-bounce" style={{ background: '#0D9488' }} />
          <span className="block w-2 h-2 rounded-full animate-bounce" style={{ background: '#14B8A6', animationDelay: '150ms' }} />
          <span className="block w-2 h-2 rounded-full animate-bounce" style={{ background: '#2DD4BF', animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #F0FDFA, #F5F3FF)' }}
    >
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="সূত্র"
            width={120}
            height={40}
            className="mx-auto h-10 w-auto mb-4"
            priority
          />
          <h1 className="text-xl font-bold" style={{ color: '#134E4A' }}>
            স্বাগতম!
          </h1>
          <p className="text-sm mt-1" style={{ color: '#5F9EA0' }}>
            তোমার তথ্য দিয়ে শুরু করো
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6"
          style={{
            background: 'white',
            border: '1px solid #F0F4F3',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* Error */}
          {error && (
            <div
              className="rounded-xl px-4 py-3 text-sm mb-4"
              style={{ background: '#FEE2E2', color: '#DC2626' }}
            >
              {error}
            </div>
          )}

          {/* Name Input */}
          <div className="mb-5">
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: '#134E4A' }}
            >
              তোমার নাম
            </label>
            <input
              type="text"
              placeholder="নাম লেখো"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500"
              style={{
                border: '1.5px solid #E2E8F0',
                color: '#134E4A',
              }}
              autoFocus
            />
            {user?.user_metadata?.full_name && (
              <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
                Google থেকে নেওয়া — চাইলে পরিবর্তন করতে পারো
              </p>
            )}
          </div>

          {/* Class Selection */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#134E4A' }}
            >
              তুমি কোন ক্লাসে পড়ো?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([9, 10] as const).map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => setClassLevel(cls)}
                  className="py-4 rounded-xl text-center font-semibold suttro-transition"
                  style={{
                    border: `2px solid ${classLevel === cls ? '#0D9488' : '#E2E8F0'}`,
                    background: classLevel === cls ? '#F0FDFA' : 'white',
                    color: classLevel === cls ? '#0D9488' : '#94A3B8',
                  }}
                >
                  <span className="text-2xl block mb-1">
                    {cls === 9 ? '৯' : '১০'}
                  </span>
                  <span className="text-xs">
                    ক্লাস {cls === 9 ? '৯' : '১০'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white suttro-transition hover:opacity-90 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #0D9488, #14B8A6)',
              boxShadow: '0 4px 14px rgba(13,148,136,0.25)',
            }}
          >
            {saving ? 'সেভ হচ্ছে...' : 'শুরু করো'}
          </button>
        </form>
      </div>
    </div>
  );
}
