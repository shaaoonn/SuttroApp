'use client';

import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

// ─────────────────────────────────────────────
// AuthGate - Forces login in Capacitor app
// Shows loading screen while checking auth
// Public paths bypass the gate
// ─────────────────────────────────────────────

const PUBLIC_PATHS = ['/login', '/privacy', '/terms', '/about', '/onboarding'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

function isInApp(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    navigator.userAgent.includes('SuttroApp') ||
    !!(window as unknown as { Capacitor?: unknown }).Capacitor
  );
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [appMode, setAppMode] = useState(false);
  const [ready, setReady] = useState(false);

  // Detect app mode once on mount
  useEffect(() => {
    setAppMode(isInApp());
  }, []);

  // Handle auth redirects
  useEffect(() => {
    if (loading) return; // still loading auth state

    // Only enforce gate in app mode
    if (!appMode) {
      setReady(true);
      return;
    }

    const isPublic = isPublicPath(pathname);

    if (!user && !isPublic) {
      router.replace('/login');
      return;
    }

    setReady(true);
  }, [user, loading, appMode, pathname, router]);

  // Show branded loading screen while auth is loading
  if (loading || (!ready && appMode)) {
    return <SuttroLoading />;
  }

  // In app, not logged in, not on public page - show loading (redirect is happening)
  if (appMode && !user && !isPublicPath(pathname)) {
    return <SuttroLoading />;
  }

  return <>{children}</>;
}

// ─────────────────────────────────────────────
// Branded Loading Screen
// ─────────────────────────────────────────────
export function SuttroLoading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: '#F0FDFA' }}
    >
      <div className="flex flex-col items-center gap-6">
        <Image
          src="/logo.png"
          alt="সূত্র"
          width={140}
          height={47}
          className="h-12 w-auto"
          priority
        />
        {/* Three bouncing dots */}
        <div className="flex items-center gap-1.5">
          <span
            className="block w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#0D9488', animationDelay: '0ms' }}
          />
          <span
            className="block w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#14B8A6', animationDelay: '150ms' }}
          />
          <span
            className="block w-2 h-2 rounded-full animate-bounce"
            style={{ background: '#2DD4BF', animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
}
