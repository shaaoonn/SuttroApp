'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

// ─────────────────────────────────────────────
// Profile — View & edit student profile
// Protected: redirects to /login if not logged in
// ─────────────────────────────────────────────

interface ProfileData {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  class_level: number;
  subscription_plan: string;
  subscription_expires_at: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState(9);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const fetchProfile = useCallback(async () => {
    if (!session?.access_token) return;
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || '');
        setClassLevel(data.class_level || 9);
      }
    } catch {
      // Silent
    } finally {
      setProfileLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    if (session?.access_token) {
      fetchProfile();
    } else if (!loading) {
      setProfileLoading(false);
    }
  }, [session?.access_token, loading, fetchProfile]);

  const handleSave = async () => {
    if (!session?.access_token) return;
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name, class_level: classLevel }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => prev ? { ...prev, ...data } : prev);
        setEditing(false);
        setSaveMsg('সংরক্ষণ হয়েছে!');
        setTimeout(() => setSaveMsg(''), 3000);
      } else {
        setSaveMsg('সংরক্ষণে সমস্যা হয়েছে');
      }
    } catch {
      setSaveMsg('নেটওয়ার্ক সমস্যা');
    } finally {
      setSaving(false);
    }
  };

  if (loading || profileLoading) {
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

  const displayName = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || '';
  const displayEmail = profile?.email || user.email || '';
  const displayPhone = profile?.phone || user.phone || '';
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
  const initials = displayName
    ? displayName.charAt(0).toUpperCase()
    : displayEmail
    ? displayEmail.charAt(0).toUpperCase()
    : displayPhone
    ? displayPhone.slice(-2)
    : '?';

  return (
    <div style={{ background: 'var(--suttro-surface)' }}>
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--suttro-deep)' }}>
            প্রোফাইল
          </h1>
          <Link
            href="/dashboard"
            className="text-sm font-medium suttro-transition hover:opacity-80"
            style={{ color: 'var(--suttro-primary)' }}
          >
            &larr; ড্যাশবোর্ড
          </Link>
        </div>

        {/* Avatar & Name Card */}
        <div
          className="rounded-[14px] border p-6 mb-6 text-center"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2"
                style={{ borderColor: 'var(--suttro-primary)' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                style={{ background: 'var(--suttro-primary)' }}
              >
                {initials}
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--suttro-deep)' }}>
            {displayName || 'নাম সেট করো'}
          </h2>
          {displayEmail && (
            <p className="text-sm mt-1" style={{ color: 'var(--suttro-muted)' }}>
              {displayEmail}
            </p>
          )}
          {displayPhone && (
            <p className="text-sm mt-1" style={{ color: 'var(--suttro-muted)' }}>
              {displayPhone}
            </p>
          )}
        </div>

        {/* Profile Details Card */}
        <div
          className="rounded-[14px] border p-6 mb-6"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--suttro-deep)' }}>
              তথ্য
            </h3>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-medium px-4 py-2 rounded-[10px] suttro-transition hover:opacity-80"
                style={{ background: 'var(--suttro-sky)', color: 'var(--suttro-primary)' }}
              >
                এডিট করো
              </button>
            )}
          </div>

          {saveMsg && (
            <div
              className="rounded-[10px] px-4 py-2.5 text-sm mb-4"
              style={{
                background: saveMsg.includes('সমস্যা') ? '#FEE2E2' : '#ECFDF5',
                color: saveMsg.includes('সমস্যা') ? '#DC2626' : '#10B981',
              }}
            >
              {saveMsg}
            </div>
          )}

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--suttro-text)' }}>
                  নাম
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="তোমার নাম লেখো"
                  className="w-full px-4 py-3 rounded-[10px] text-sm border outline-none focus:ring-2"
                  style={{
                    borderColor: 'var(--suttro-border)',
                    color: 'var(--suttro-text)',
                    background: 'var(--suttro-surface)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--suttro-text)' }}>
                  শ্রেণি
                </label>
                <select
                  value={classLevel}
                  onChange={(e) => setClassLevel(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-[10px] text-sm border outline-none"
                  style={{
                    borderColor: 'var(--suttro-border)',
                    color: 'var(--suttro-text)',
                    background: 'var(--suttro-surface)',
                  }}
                >
                  <option value={9}>৯ম শ্রেণি</option>
                  <option value={10}>১০ম শ্রেণি</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-[10px] text-sm font-medium text-white suttro-transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--suttro-primary)' }}
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করো'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setName(profile?.name || '');
                    setClassLevel(profile?.class_level || 9);
                  }}
                  className="px-6 py-2.5 rounded-[10px] text-sm font-medium border suttro-transition"
                  style={{ borderColor: 'var(--suttro-border)', color: 'var(--suttro-muted)' }}
                >
                  বাতিল
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--suttro-border)' }}>
                <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>নাম</span>
                <span className="text-sm font-medium" style={{ color: 'var(--suttro-text)' }}>
                  {displayName || '—'}
                </span>
              </div>
              {displayPhone && (
                <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--suttro-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>ফোন</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--suttro-text)' }}>
                    {displayPhone}
                  </span>
                </div>
              )}
              {displayEmail && (
                <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--suttro-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>ইমেইল</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--suttro-text)' }}>
                    {displayEmail}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--suttro-border)' }}>
                <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>শ্রেণি</span>
                <span className="text-sm font-medium" style={{ color: 'var(--suttro-text)' }}>
                  {profile?.class_level === 10 ? '১০ম শ্রেণি' : '৯ম শ্রেণি'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>সাবস্ক্রিপশন</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{
                      background: profile?.subscription_plan === 'pro' ? '#EDE9FE'
                        : profile?.subscription_plan === 'premium' ? '#ECFDF5'
                        : 'var(--suttro-sky)',
                      color: profile?.subscription_plan === 'pro' ? '#7C3AED'
                        : profile?.subscription_plan === 'premium' ? '#0D9488'
                        : 'var(--suttro-muted)',
                    }}
                  >
                    {profile?.subscription_plan === 'pro' ? 'প্রো'
                      : profile?.subscription_plan === 'premium' ? 'প্রিমিয়াম'
                      : 'ফ্রি'}
                  </span>
                  {profile?.subscription_plan === 'free' && (
                    <Link
                      href="/pricing"
                      className="text-xs font-medium suttro-transition hover:opacity-80"
                      style={{ color: 'var(--suttro-primary)' }}
                    >
                      আপগ্রেড →
                    </Link>
                  )}
                </div>
              </div>
              {profile?.subscription_expires_at && profile.subscription_plan !== 'free' && (
                <div className="flex items-center justify-between py-3 border-t" style={{ borderColor: 'var(--suttro-border)' }}>
                  <span className="text-sm" style={{ color: 'var(--suttro-muted)' }}>মেয়াদ শেষ</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--suttro-text)' }}>
                    {new Date(profile.subscription_expires_at).toLocaleDateString('bn-BD')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => signOut()}
            className="w-full py-3 rounded-[10px] text-base font-medium border suttro-transition hover:bg-red-50"
            style={{ borderColor: '#FCA5A5', color: '#DC2626' }}
          >
            লগ আউট
          </button>
        </div>
      </div>
    </div>
  );
}
