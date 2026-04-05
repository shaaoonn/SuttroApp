'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ─────────────────────────────────────────────
// BottomNav — App-like bottom navigation bar
// Shows on mobile only (hidden on lg: and above)
// ─────────────────────────────────────────────

const NAV_ITEMS = [
  {
    href: '/',
    label: 'হোম',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/simulations',
    label: 'সিমুলেশন',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
        <path d="M8 12h8" />
      </svg>
    ),
  },
  {
    href: '/classes',
    label: 'ক্লাস',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
  },
  {
    href: '/exams',
    label: 'পরীক্ষা',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on simulation/class player pages (fullscreen content)
  if (pathname.startsWith('/sim/') || pathname.startsWith('/class/') || pathname.startsWith('/exam/')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: 'var(--suttro-border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-[60px]">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 w-16 h-[56px] rounded-lg suttro-transition"
              style={{
                color: isActive ? 'var(--suttro-primary)' : 'var(--suttro-muted)',
              }}
            >
              <span className={isActive ? 'opacity-100' : 'opacity-60'}>
                {item.icon}
              </span>
              <span className="text-xs font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
