'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

// ─────────────────────────────────────────────
// PageTransition - fade+slide animation on route change
// Wraps children, replays page-enter animation when pathname changes.
// ─────────────────────────────────────────────

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Re-trigger animation by removing + re-adding class
    el.classList.remove('page-enter');
    // Force reflow
    void el.offsetHeight;
    el.classList.add('page-enter');
  }, [pathname]);

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  );
}
