'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// Login — Google OAuth only
// Phone verification removed (was using Firebase Phone Auth, which is paid).
// Phone number is now collected during onboarding.
// ─────────────────────────────────────────────

function useIsApp() {
  const [isApp, setIsApp] = useState(false);
  useEffect(() => {
    setIsApp(
      navigator.userAgent.includes('SuttroApp') ||
      !!(window as unknown as { Capacitor?: unknown }).Capacitor
    );
  }, []);
  return isApp;
}

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const isApp = useIsApp();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <div className="text-center mb-10">
          <Image
            src="/logo.png"
            alt="সূত্র | suttro.app"
            width={180}
            height={60}
            className="mx-auto h-16 w-auto mb-4"
            priority
          />
          <p
            className="text-sm font-medium"
            style={{ color: '#5F9EA0' }}
          >
            বিজ্ঞান পড়ার সবচেয়ে সহজ উপায়
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'white',
            border: '1px solid #F0F4F3',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          <h2
            className="text-xl font-bold text-center mb-2"
            style={{ color: '#134E4A' }}
          >
            লগ ইন করো
          </h2>
          <p
            className="text-sm text-center mb-6"
            style={{ color: '#5F9EA0' }}
          >
            Google অ্যাকাউন্ট দিয়ে এক ট্যাপে
          </p>

          {/* Error */}
          {error && (
            <div
              className="rounded-[10px] px-4 py-3 text-sm mb-4"
              style={{ background: '#FEE2E2', color: '#DC2626' }}
            >
              {error}
            </div>
          )}

          {/* Google Sign-In — hidden in Capacitor WebView (Google blocks OAuth).
              The Android app uses native Credential Manager instead. */}
          {!isApp ? (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-base font-semibold suttro-transition disabled:opacity-60"
              style={{
                background: 'white',
                border: '1.5px solid #DADCE0',
                color: '#3C4043',
                boxShadow: '0 2px 8px rgba(60,64,67,0.08)',
              }}
            >
              {googleLoading ? (
                <>
                  <span
                    className="inline-block w-5 h-5 rounded-full border-2 animate-spin"
                    style={{
                      borderColor: '#DADCE0',
                      borderTopColor: '#0D9488',
                    }}
                  />
                  <span>Google-এ যাচ্ছে...</span>
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
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
                  <span>Google দিয়ে লগ ইন করো</span>
                </>
              )}
            </button>
          ) : (
            <div
              className="rounded-xl px-4 py-4 text-sm text-center"
              style={{ background: '#F0FDFA', color: '#134E4A' }}
            >
              অ্যাপে লগ ইন করতে সূত্র অ্যান্ড্রয়েড অ্যাপ ব্যবহার করো
            </div>
          )}

          <p
            className="text-center text-xs mt-6"
            style={{ color: '#94A3B8' }}
          >
            লগ ইন করলে তুমি আমাদের{' '}
            <a
              href="/terms"
              className="font-medium"
              style={{ color: '#0D9488' }}
            >
              শর্তাবলী
            </a>{' '}
            ও{' '}
            <a
              href="/privacy"
              className="font-medium"
              style={{ color: '#0D9488' }}
            >
              গোপনীয়তা নীতি
            </a>{' '}
            মেনে নিচ্ছ।
          </p>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: '#94A3B8' }}
        >
          সাহায্য দরকার? ই-মেইল করো{' '}
          <a
            href="mailto:help@suttro.app"
            className="font-medium"
            style={{ color: '#0D9488' }}
          >
            help@suttro.app
          </a>
        </p>
      </div>
    </div>
  );
}
