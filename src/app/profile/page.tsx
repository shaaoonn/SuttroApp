'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';

// ─────────────────────────────────────────────
// Profile — View & edit student profile
// Mobile-first design
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
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
    if (session?.access_token) fetchProfile();
    else if (!loading) setProfileLoading(false);
  }, [session?.access_token, loading, fetchProfile]);

  const handleDeleteAccount = async () => {
    if (!session?.access_token) return;
    if (deleteConfirmText.trim() !== 'DELETE') {
      setDeleteError('"DELETE" লিখো (বড় হাতের)');
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        // Account deleted — sign out and redirect
        await signOut();
        router.push('/login?deleted=1');
      } else {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error || 'অ্যাকাউন্ট ডিলিট করতে সমস্যা হয়েছে');
        setDeleting(false);
      }
    } catch {
      setDeleteError('নেটওয়ার্ক সমস্যা');
      setDeleting(false);
    }
  };

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
      <div className="flex-1 flex items-center justify-center" style={{ background: '#F8FAFB' }}>
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">⏳</div>
          <p style={{ color: '#94A3B8' }}>লোড হচ্ছে...</p>
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
    : '?';

  return (
    <div style={{ background: '#F8FAFB' }}>
      {/* ══════ MOBILE ══════ */}
      <div className="lg:hidden">
        {/* Profile header */}
        <div
          className="text-center px-4 py-6"
          style={{ background: 'linear-gradient(180deg, #F0FDFA, #F8FAFB)' }}
        >
          {/* Avatar */}
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt=""
              className="w-16 h-16 mx-auto mb-2 rounded-full object-cover"
              style={{
                border: '2.5px solid #0D9488',
                boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
              }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl text-white font-bold"
              style={{
                background: 'linear-gradient(135deg, #0D9488, #2DD4BF)',
                boxShadow: '0 4px 16px rgba(13,148,136,0.3)',
              }}
            >
              {initials}
            </div>
          )}
          <div className="text-base font-bold" style={{ color: '#134E4A' }}>
            {displayName || 'নাম সেট করো'}
          </div>
          {displayEmail && (
            <div className="text-[11px]" style={{ color: '#5F9EA0' }}>
              {displayEmail}
            </div>
          )}
          {displayPhone && (
            <div className="text-[11px]" style={{ color: '#5F9EA0' }}>
              {displayPhone}
            </div>
          )}
        </div>

        <div className="px-4 pb-6">
          {/* Save message */}
          {saveMsg && (
            <div
              className="rounded-xl px-4 py-2.5 text-xs mb-3"
              style={{
                background: saveMsg.includes('সমস্যা') ? '#FEE2E2' : '#ECFDF5',
                color: saveMsg.includes('সমস্যা') ? '#DC2626' : '#10B981',
              }}
            >
              {saveMsg}
            </div>
          )}

          {/* Info card */}
          <div className="rounded-xl p-3.5 mb-3" style={{ background: 'white', border: '1px solid #F0F4F3' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: '#134E4A' }}>
                তথ্য
              </span>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-[11px] font-medium px-3 py-1 rounded-lg suttro-transition"
                  style={{ background: '#F0FDFA', color: '#0D9488' }}
                >
                  এডিট
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#5F9EA0' }}>নাম</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="তোমার নাম লেখো"
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none focus:ring-2"
                    style={{ border: '1px solid #E2E8F0', color: '#134E4A', background: '#F8FAFB' }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1" style={{ color: '#5F9EA0' }}>শ্রেণি</label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                    style={{ border: '1px solid #E2E8F0', color: '#134E4A', background: '#F8FAFB' }}
                  >
                    <option value={9}>৯ম শ্রেণি</option>
                    <option value={10}>১০ম শ্রেণি</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold text-white suttro-transition disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #0D9488, #14B8A6)' }}
                  >
                    {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করো'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setName(profile?.name || '');
                      setClassLevel(profile?.class_level || 9);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-medium suttro-transition"
                    style={{ border: '1px solid #E2E8F0', color: '#94A3B8' }}
                  >
                    বাতিল
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                <InfoRow label="নাম" value={displayName || '—'} />
                {displayPhone && <InfoRow label="ফোন" value={displayPhone} />}
                {displayEmail && <InfoRow label="ইমেইল" value={displayEmail} />}
                <InfoRow
                  label="শ্রেণি"
                  value={profile?.class_level === 10 ? '১০ম শ্রেণি' : '৯ম শ্রেণি'}
                />
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-[11px]" style={{ color: '#94A3B8' }}>সাবস্ক্রিপশন</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: profile?.subscription_plan === 'pro' ? '#EDE9FE'
                          : profile?.subscription_plan === 'premium' ? '#ECFDF5'
                          : '#F8FAFB',
                        color: profile?.subscription_plan === 'pro' ? '#7C3AED'
                          : profile?.subscription_plan === 'premium' ? '#0D9488'
                          : '#94A3B8',
                      }}
                    >
                      {profile?.subscription_plan === 'pro' ? 'প্রো'
                        : profile?.subscription_plan === 'premium' ? 'প্রিমিয়াম'
                        : 'ফ্রি'}
                    </span>
                    {profile?.subscription_plan === 'free' && (
                      <Link href="/pricing" className="text-[10px] font-medium" style={{ color: '#0D9488' }}>
                        আপগ্রেড →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut()}
            className="w-full py-2.5 rounded-xl text-xs font-medium suttro-transition mb-2"
            style={{ border: '1px solid #FCA5A5', color: '#DC2626' }}
          >
            লগ আউট
          </button>

          {/* Delete account (Google Play Policy requirement) */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-2.5 rounded-xl text-[11px] font-medium suttro-transition"
            style={{ background: 'transparent', color: '#94A3B8', textDecoration: 'underline' }}
          >
            অ্যাকাউন্ট ডিলিট করো
          </button>
        </div>
      </div>

      {/* ══════ DESKTOP (preserved) ══════ */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold" style={{ color: '#134E4A' }}>প্রোফাইল</h1>
            <Link href="/dashboard" className="text-sm font-medium suttro-transition hover:opacity-80" style={{ color: '#0D9488' }}>
              ← ড্যাশবোর্ড
            </Link>
          </div>

          <div className="rounded-[14px] border p-6 mb-6 text-center" style={{ borderColor: '#F0F4F3', background: 'white' }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="w-20 h-20 mx-auto mb-4 rounded-full object-cover border-2" style={{ borderColor: '#0D9488' }} referrerPolicy="no-referrer" />
            ) : (
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: '#0D9488' }}>
                {initials}
              </div>
            )}
            <h2 className="text-xl font-bold" style={{ color: '#134E4A' }}>{displayName || 'নাম সেট করো'}</h2>
            {displayEmail && <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{displayEmail}</p>}
            {displayPhone && <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{displayPhone}</p>}
          </div>

          <div className="rounded-[14px] border p-6 mb-6" style={{ borderColor: '#F0F4F3', background: 'white' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#134E4A' }}>তথ্য</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-sm font-medium px-4 py-2 rounded-[10px] suttro-transition hover:opacity-80" style={{ background: '#F0FDFA', color: '#0D9488' }}>
                  এডিট করো
                </button>
              )}
            </div>

            {saveMsg && (
              <div className="rounded-[10px] px-4 py-2.5 text-sm mb-4" style={{ background: saveMsg.includes('সমস্যা') ? '#FEE2E2' : '#ECFDF5', color: saveMsg.includes('সমস্যা') ? '#DC2626' : '#10B981' }}>
                {saveMsg}
              </div>
            )}

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#134E4A' }}>নাম</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="তোমার নাম লেখো" className="w-full px-4 py-3 rounded-[10px] text-sm border outline-none focus:ring-2" style={{ borderColor: '#E2E8F0', color: '#134E4A', background: '#F8FAFB' }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#134E4A' }}>শ্রেণি</label>
                  <select value={classLevel} onChange={(e) => setClassLevel(Number(e.target.value))} className="w-full px-4 py-3 rounded-[10px] text-sm border outline-none" style={{ borderColor: '#E2E8F0', color: '#134E4A', background: '#F8FAFB' }}>
                    <option value={9}>৯ম শ্রেণি</option>
                    <option value={10}>১০ম শ্রেণি</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-[10px] text-sm font-medium text-white suttro-transition hover:opacity-90 disabled:opacity-50" style={{ background: '#0D9488' }}>
                    {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করো'}
                  </button>
                  <button onClick={() => { setEditing(false); setName(profile?.name || ''); setClassLevel(profile?.class_level || 9); }} className="px-6 py-2.5 rounded-[10px] text-sm font-medium border suttro-transition" style={{ borderColor: '#E2E8F0', color: '#94A3B8' }}>
                    বাতিল
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <DesktopInfoRow label="নাম" value={displayName || '—'} />
                {displayPhone && <DesktopInfoRow label="ফোন" value={displayPhone} />}
                {displayEmail && <DesktopInfoRow label="ইমেইল" value={displayEmail} />}
                <DesktopInfoRow label="শ্রেণি" value={profile?.class_level === 10 ? '১০ম শ্রেণি' : '৯ম শ্রেণি'} />
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm" style={{ color: '#94A3B8' }}>সাবস্ক্রিপশন</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium px-3 py-1 rounded-full" style={{
                      background: profile?.subscription_plan === 'pro' ? '#EDE9FE' : profile?.subscription_plan === 'premium' ? '#ECFDF5' : '#F8FAFB',
                      color: profile?.subscription_plan === 'pro' ? '#7C3AED' : profile?.subscription_plan === 'premium' ? '#0D9488' : '#94A3B8',
                    }}>
                      {profile?.subscription_plan === 'pro' ? 'প্রো' : profile?.subscription_plan === 'premium' ? 'প্রিমিয়াম' : 'ফ্রি'}
                    </span>
                    {profile?.subscription_plan === 'free' && (
                      <Link href="/pricing" className="text-xs font-medium suttro-transition hover:opacity-80" style={{ color: '#0D9488' }}>আপগ্রেড →</Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={() => signOut()} className="w-full py-3 rounded-[10px] text-base font-medium border suttro-transition hover:bg-red-50 mb-3" style={{ borderColor: '#FCA5A5', color: '#DC2626' }}>
            লগ আউট
          </button>

          {/* Delete account (Google Play Policy requirement) */}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-3 rounded-[10px] text-sm font-medium suttro-transition"
            style={{ background: 'transparent', color: '#94A3B8', textDecoration: 'underline' }}
          >
            অ্যাকাউন্ট ডিলিট করো
          </button>
        </div>
      </div>

      {/* Delete account confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-5"
            style={{ background: 'white' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">⚠️</div>
              <h2 className="text-lg font-bold mb-1" style={{ color: '#DC2626' }}>
                অ্যাকাউন্ট ডিলিট করবে?
              </h2>
              <p className="text-xs" style={{ color: '#64748B' }}>
                এই কাজটি করা যাবে না আবার। তোমার প্রোফাইল, পরীক্ষার ফলাফল, অগ্রগতি সবকিছু চিরতরে মুছে যাবে।
              </p>
            </div>

            <div
              className="rounded-lg p-3 mb-4 text-xs"
              style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
            >
              <strong>যা যা মুছে যাবে:</strong>
              <ul className="mt-1 ml-4 list-disc space-y-0.5">
                <li>তোমার নাম, ইমেইল, ফোন</li>
                <li>সব পরীক্ষার ফলাফল</li>
                <li>সব দৈনিক পাঠের অগ্রগতি</li>
                <li>সাবস্ক্রিপশন তথ্য</li>
                <li>Google লগইন সংযোগ</li>
              </ul>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#134E4A' }}>
                নিশ্চিত হতে নিচে <code className="font-bold">DELETE</code> লেখো (বড় হাতের)
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                disabled={deleting}
                placeholder="DELETE"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400"
                style={{ border: '1px solid #FCA5A5', color: '#134E4A', background: '#FFFBFB' }}
              />
            </div>

            {deleteError && (
              <div
                className="rounded-lg px-3 py-2 text-xs mb-3"
                style={{ background: '#FEE2E2', color: '#DC2626' }}
              >
                {deleteError}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium suttro-transition disabled:opacity-50"
                style={{ border: '1px solid #E2E8F0', color: '#64748B' }}
              >
                বাতিল
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting || deleteConfirmText.trim() !== 'DELETE'}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white suttro-transition disabled:opacity-50"
                style={{ background: '#DC2626' }}
              >
                {deleting ? 'ডিলিট হচ্ছে...' : 'স্থায়ীভাবে ডিলিট'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: '#F0F4F3' }}>
      <span className="text-[11px]" style={{ color: '#94A3B8' }}>{label}</span>
      <span className="text-[11px] font-medium" style={{ color: '#134E4A' }}>{value}</span>
    </div>
  );
}

function DesktopInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: '#F0F4F3' }}>
      <span className="text-sm" style={{ color: '#94A3B8' }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: '#134E4A' }}>{value}</span>
    </div>
  );
}
