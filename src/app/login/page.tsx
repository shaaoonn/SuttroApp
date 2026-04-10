'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// Login — Phone OTP + Google OAuth
// Design reference Page 2
// ─────────────────────────────────────────────

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { sendOTP, verifyOTP, signInWithGoogle } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullPhone = `+880${phone.replace(/^0+/, '')}`;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('সঠিক মোবাইল নম্বর দাও');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await sendOTP(fullPhone);
      if (authError) setError(authError);
      else setStep('otp');
    } catch {
      setError('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করো');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('৬ সংখ্যার OTP দাও');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await verifyOTP(fullPhone, otp);
      if (authError) setError(authError);
      else router.push('/dashboard');
    } catch {
      setError('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করো');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) {
        setError(authError);
        setGoogleLoading(false);
      }
    } catch {
      setError('Google লগইনে সমস্যা — আবার চেষ্টা করো');
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(160deg, #F0FDFA, #F5F3FF)',
      }}
    >
      <div className="w-full max-w-sm px-5">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo.png"
            alt="সূত্র | suttro.app"
            width={160}
            height={54}
            className="mx-auto h-14 w-auto"
            priority
          />
        </div>

        {/* Auth Card */}
        <div
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
              className="rounded-[10px] px-4 py-3 text-sm mb-4"
              style={{ background: '#FEE2E2', color: '#DC2626' }}
            >
              {error}
            </div>
          )}

          {step === 'phone' ? (
            <>
              <h2
                className="text-lg font-semibold text-center mb-4"
                style={{ color: '#134E4A' }}
              >
                লগ ইন করো
              </h2>

              {/* Phone input */}
              <form onSubmit={handleSendOTP}>
                <div className="mb-3">
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: '#5F9EA0' }}
                  >
                    ফোন নম্বর
                  </label>
                  <div
                    className="flex rounded-[10px] overflow-hidden"
                    style={{ border: '1.5px solid #E2E8F0' }}
                  >
                    <span
                      className="flex items-center px-3 text-sm"
                      style={{
                        background: '#F8FAFB',
                        color: '#94A3B8',
                        borderRight: '1px solid #E2E8F0',
                      }}
                    >
                      +880
                    </span>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ''))
                      }
                      maxLength={11}
                      autoFocus
                      className="flex-1 px-3 py-2.5 text-sm outline-none"
                      style={{ color: '#134E4A' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white suttro-transition hover:opacity-90 disabled:opacity-50 mb-3"
                  style={{
                    background:
                      'linear-gradient(135deg, #0D9488, #14B8A6)',
                    boxShadow:
                      '0 4px 14px rgba(13,148,136,0.25)',
                  }}
                >
                  {loading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠাও'}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex-1 h-px"
                  style={{ background: '#E2E8F0' }}
                />
                <span className="text-xs" style={{ color: '#94A3B8' }}>
                  অথবা
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: '#E2E8F0' }}
                />
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-sm font-medium suttro-transition hover:bg-black/5 disabled:opacity-50"
                style={{
                  border: '1px solid #E2E8F0',
                  color: '#134E4A',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {googleLoading
                  ? 'Google-এ যাচ্ছে...'
                  : 'Google দিয়ে লগ ইন'}
              </button>
            </>
          ) : (
            /* ── OTP Step ── */
            <>
              <div className="text-center mb-4">
                <div
                  className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: '#F0FDFA',
                    color: '#0D9488',
                  }}
                >
                  ✉
                </div>
                <h2
                  className="text-lg font-semibold mb-1"
                  style={{ color: '#134E4A' }}
                >
                  OTP যাচাই করো
                </h2>
                <p className="text-xs" style={{ color: '#5F9EA0' }}>
                  {fullPhone} নম্বরে কোড পাঠানো হয়েছে
                </p>
              </div>

              <form onSubmit={handleVerifyOTP}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="_ _ _ _ _ _"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, ''))
                  }
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-3 rounded-[10px] text-center tracking-[0.5em] font-mono text-lg outline-none focus:ring-2 mb-4"
                  style={{
                    border: `1.5px solid ${otp.length > 0 ? '#0D9488' : '#E2E8F0'}`,
                    color: '#134E4A',
                  }}
                />

                <button
                  type="submit"
                  disabled={loading || otp.length < 6}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white suttro-transition hover:opacity-90 disabled:opacity-50 mb-2"
                  style={{
                    background:
                      'linear-gradient(135deg, #0D9488, #14B8A6)',
                    boxShadow:
                      '0 4px 14px rgba(13,148,136,0.25)',
                  }}
                >
                  {loading ? 'যাচাই হচ্ছে...' : 'যাচাই করো'}
                </button>

                <p className="text-center text-xs" style={{ color: '#94A3B8' }}>
                  কোড পাওনি?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                      setError(null);
                    }}
                    className="font-semibold"
                    style={{ color: '#0D9488' }}
                  >
                    আবার পাঠাও
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
