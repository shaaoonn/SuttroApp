'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// ─────────────────────────────────────────────
// AppBar — Native-style top bar (mobile only)
// Home: Logo + streak badge + avatar
// Sub-pages: back button + centered title
// ─────────────────────────────────────────────

const PAGE_TITLES: Record<string, string> = {
  '/': 'সূত্র',
  '/guide': 'গাইড',
  '/exams': 'পরীক্ষা',
  '/dashboard': 'ড্যাশবোর্ড',
  '/profile': 'প্রোফাইল',
  '/simulations': 'সিমুলেশন',
  '/classes': 'ক্লাস আর্কাইভ',
  '/daily': 'দৈনিক চ্যালেঞ্জ',
  '/review': 'রিভিউ',
  '/achievements': 'অ্যাচিভমেন্ট',
  '/leaderboard': 'লিডারবোর্ড',
  '/pricing': 'প্রাইসিং',
  '/login': 'লগ ইন',
  '/about': 'আমাদের সম্পর্কে',
  '/payment/success': 'পেমেন্ট সফল',
  '/payment/failed': 'পেমেন্ট ব্যর্থ',
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/sim/')) return 'সিমুলেশন';
  if (pathname.startsWith('/exam/')) return 'পরীক্ষা';
  if (pathname.startsWith('/class/')) return 'ক্লাস';
  if (pathname.startsWith('/guide/')) return 'গাইড';
  if (pathname.startsWith('/practice/')) return 'অনুশীলন';
  return 'সূত্র';
}

// Pages where AppBar should be hidden (immersive content)
const HIDDEN_PATHS = ['/sim/', '/class/'];

// Main tab routes — no back button needed
const TAB_ROUTES = ['/', '/guide', '/exams', '/dashboard'];

export default function AppBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  // Hide on immersive content pages
  if (HIDDEN_PATHS.some((p) => pathname.startsWith(p))) return null;

  const isTab = TAB_ROUTES.includes(pathname);
  const isHome = pathname === '/';
  const title = getTitle(pathname);

  // User initial for avatar
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    '';
  const initial = displayName ? displayName.charAt(0) : 'সূ';

  return (
    <header
      className="sticky top-0 z-50 lg:hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F0F4F3',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex items-center h-14 px-4">
        {isHome ? (
          /* ── Home: Logo + streak badge + avatar ── */
          <>
            <h1
              className="text-xl font-bold flex-1"
              style={{ color: '#0D9488' }}
            >
              সূত্র
            </h1>
            <div className="flex items-center gap-2">
              {user && (
                <div
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white flex items-center gap-1"
                  style={{
                    background:
                      'linear-gradient(135deg, #F59E0B, #FBBF24)',
                  }}
                >
                  ★ 7
                </div>
              )}
              <Link
                href={user ? '/dashboard' : '/login'}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: user
                    ? 'linear-gradient(135deg, #0D9488, #2DD4BF)'
                    : '#E2E8F0',
                  color: user ? '#fff' : '#94A3B8',
                }}
              >
                {user ? initial : '?'}
              </Link>
            </div>
          </>
        ) : isTab ? (
          /* ── Other tab pages: title left-aligned ── */
          <>
            <h1
              className="text-xl font-bold flex-1"
              style={{ color: '#134E4A' }}
            >
              {title}
            </h1>
          </>
        ) : (
          /* ── Sub-page: back button + centered title ── */
          <>
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full active:bg-black/5 suttro-transition"
              aria-label="পেছনে যাও"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#134E4A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <h1
              className="flex-1 text-center text-lg font-semibold truncate px-2"
              style={{ color: '#134E4A' }}
            >
              {title}
            </h1>
            {/* Spacer to keep title centered */}
            <div className="w-10" />
          </>
        )}
      </div>
    </header>
  );
}
