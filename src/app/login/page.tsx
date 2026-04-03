'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// Login — Phone OTP (Bangladesh +880)
// Step 1: Enter phone → Step 2: Enter OTP
// ─────────────────────────────────────────────

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { sendOTP, verifyOTP } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
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
      if (authError) {
        setError(authError);
      } else {
        setStep('otp');
      }
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
      if (authError) {
        setError(authError);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('নেটওয়ার্ক সমস্যা — আবার চেষ্টা করো');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--suttro-surface)' }}>
      <div className="w-full max-w-sm px-4">
        <div
          className="rounded-[14px] border p-6 sm:p-8"
          style={{ borderColor: 'var(--suttro-border)', background: 'var(--suttro-white)' }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--suttro-deep)' }}>
              সূত্র-তে লগ ইন
            </h1>
            <p className="text-sm" style={{ color: 'var(--suttro-muted)' }}>
              {step === 'phone' ? 'তোমার মোবাইল নম্বর দাও' : 'OTP দাও যেটা তোমার ফোনে এসেছে'}
            </p>
          </div>

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
            <form onSubmit={handleSendOTP}>
              {/* Phone input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--suttro-text)' }}>
                  মোবাইল নম্বর
                </label>
                <div className="flex gap-2">
                  <span
                    className="flex items-center px-3 rounded-[10px] text-sm border"
                    style={{ borderColor: 'var(--suttro-border)', color: 'var(--suttro-muted)' }}
                  >
                    +880
                  </span>
                  <input
                    type="tel"
                    placeholder="1XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                    autoFocus
                    className="flex-1 px-4 py-3 rounded-[10px] text-sm border outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--suttro-border)',
                      color: 'var(--suttro-text)',
                      background: 'var(--suttro-surface)',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length < 10}
                className="w-full py-3 rounded-[10px] text-sm font-medium text-white suttro-transition hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--suttro-primary)' }}
              >
                {loading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠাও'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              {/* OTP input */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--suttro-text)' }}>
                  OTP কোড
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="৬ সংখ্যার কোড"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  autoFocus
                  className="w-full px-4 py-3 rounded-[10px] text-sm border outline-none focus:ring-2 text-center tracking-[0.5em] font-mono text-lg"
                  style={{
                    borderColor: 'var(--suttro-border)',
                    color: 'var(--suttro-text)',
                    background: 'var(--suttro-surface)',
                  }}
                />
              </div>

              <p className="text-xs mb-4" style={{ color: 'var(--suttro-muted)' }}>
                {fullPhone} নম্বরে পাঠানো হয়েছে
              </p>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-[10px] text-sm font-medium text-white suttro-transition hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--suttro-primary)' }}
              >
                {loading ? 'যাচাই হচ্ছে...' : 'লগ ইন করো'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
                className="w-full py-2.5 mt-2 rounded-[10px] text-sm font-medium suttro-transition"
                style={{ color: 'var(--suttro-muted)' }}
              >
                &larr; নম্বর বদলাও
              </button>
            </form>
          )}

          <p className="text-xs text-center mt-4" style={{ color: 'var(--suttro-muted)' }}>
            কোনো পাসওয়ার্ড লাগবে না — শুধু OTP দিয়ে লগ ইন।
          </p>
        </div>
      </div>
    </div>
  );
}
