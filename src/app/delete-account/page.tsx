'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────
// Account Deletion Page
// Google Play Policy: must be publicly reachable, linked from Play Store listing
// Users can request deletion here even without being logged in
// ─────────────────────────────────────────────

export default function DeleteAccountPage() {
  const { user, session, loading, signOut } = useAuth();
  const router = useRouter();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Show deleted success message if redirected here after deletion
    const params = new URLSearchParams(window.location.search);
    if (params.get('deleted') === '1') {
      setSuccess(true);
    }
  }, []);

  const handleDelete = async () => {
    if (!session?.access_token) {
      setError('আগে লগইন করো');
      return;
    }
    if (confirmText.trim() !== 'DELETE') {
      setError('"DELETE" লিখো (বড় হাতের)');
      return;
    }
    setDeleting(true);
    setError('');
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        await signOut();
        setSuccess(true);
        setDeleting(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'ডিলিট করতে সমস্যা হয়েছে');
        setDeleting(false);
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: '#F8FAFB' }}>
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="text-2xl font-bold"
            style={{ color: '#0D9488', fontFamily: 'var(--font-bengali)' }}
          >
            সূত্র
          </Link>
          <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>
            suttro.app
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ background: 'white', border: '1px solid #F0F4F3' }}
        >
          {success ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">✅</div>
              <h1 className="text-lg font-bold mb-2" style={{ color: '#134E4A' }}>
                অ্যাকাউন্ট ডিলিট হয়েছে
              </h1>
              <p className="text-sm mb-4" style={{ color: '#64748B' }}>
                তোমার সব তথ্য আমাদের সার্ভার থেকে মুছে ফেলা হয়েছে। ভবিষ্যতে চাইলে আবার নতুন অ্যাকাউন্ট বানাতে পারবে।
              </p>
              <Link
                href="/"
                className="inline-block py-2 px-6 rounded-lg text-sm font-medium text-white"
                style={{ background: '#0D9488' }}
              >
                হোমপেজে ফেরো
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-5">
                <div className="text-4xl mb-2">🗑️</div>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#DC2626' }}>
                  অ্যাকাউন্ট ডিলিট
                </h1>
                <p className="text-xs" style={{ color: '#64748B' }}>
                  Account Deletion Request
                </p>
              </div>

              <div
                className="rounded-lg p-4 mb-5 text-sm"
                style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' }}
              >
                <p className="font-semibold mb-2">যা যা স্থায়ীভাবে মুছে যাবে:</p>
                <ul className="ml-4 list-disc space-y-1 text-xs">
                  <li>তোমার নাম, ইমেইল, ফোন নম্বর</li>
                  <li>সব পরীক্ষার ফলাফল ও স্কোর</li>
                  <li>সব দৈনিক পাঠের অগ্রগতি</li>
                  <li>লিডারবোর্ড রেকর্ড</li>
                  <li>সাবস্ক্রিপশন তথ্য (রিফান্ড হবে না)</li>
                  <li>Google লগইন সংযোগ</li>
                </ul>
                <p className="mt-2 text-xs">
                  <strong>এই কাজ আবার করা যাবে না।</strong>
                </p>
              </div>

              {loading ? (
                <div className="text-center py-4 text-sm" style={{ color: '#94A3B8' }}>
                  লোড হচ্ছে...
                </div>
              ) : !user ? (
                <div className="text-center">
                  <p className="text-sm mb-4" style={{ color: '#64748B' }}>
                    অ্যাকাউন্ট ডিলিট করতে আগে লগইন করতে হবে।
                  </p>
                  <Link
                    href="/login?next=/delete-account"
                    className="inline-block py-2.5 px-6 rounded-lg text-sm font-medium text-white"
                    style={{ background: '#0D9488' }}
                  >
                    লগইন করো
                  </Link>
                </div>
              ) : (
                <>
                  <div
                    className="rounded-lg p-3 mb-4 text-xs"
                    style={{ background: '#F8FAFB', color: '#64748B' }}
                  >
                    <strong>লগইনকৃত:</strong> {user.email}
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: '#134E4A' }}>
                      নিশ্চিত হতে নিচে <code className="font-bold">DELETE</code> লেখো
                    </label>
                    <input
                      type="text"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      disabled={deleting}
                      placeholder="DELETE"
                      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400"
                      style={{ border: '1px solid #FCA5A5', color: '#134E4A', background: '#FFFBFB' }}
                    />
                  </div>

                  {error && (
                    <div
                      className="rounded-lg px-3 py-2 text-xs mb-4"
                      style={{ background: '#FEE2E2', color: '#DC2626' }}
                    >
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleDelete}
                    disabled={deleting || confirmText.trim() !== 'DELETE'}
                    className="w-full py-3 rounded-lg text-sm font-semibold text-white suttro-transition disabled:opacity-50"
                    style={{ background: '#DC2626' }}
                  >
                    {deleting ? 'ডিলিট হচ্ছে...' : 'স্থায়ীভাবে ডিলিট করো'}
                  </button>

                  <Link
                    href="/profile"
                    className="block text-center mt-3 text-xs"
                    style={{ color: '#64748B' }}
                  >
                    ← বাতিল করে প্রোফাইলে ফেরো
                  </Link>
                </>
              )}

              <div
                className="mt-6 pt-4 text-xs"
                style={{ borderTop: '1px solid #F0F4F3', color: '#94A3B8' }}
              >
                <p className="mb-1">
                  <strong>সাহায্য দরকার?</strong> ই-মেইল করো{' '}
                  <a href="mailto:help@suttro.app" style={{ color: '#0D9488' }}>
                    help@suttro.app
                  </a>
                </p>
                <p>
                  তথ্য সংগ্রহ সম্পর্কে জানতে{' '}
                  <Link href="/privacy" style={{ color: '#0D9488' }}>
                    গোপনীয়তা নীতি
                  </Link>{' '}
                  দেখো।
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
