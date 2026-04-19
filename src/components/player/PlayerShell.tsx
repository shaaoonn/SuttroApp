'use client';

import { useRef, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useFullscreen } from '@/hooks/useFullscreen';
import BottomToolbar from './BottomToolbar';
import type { PanZoomControls } from './BottomToolbar';
import type { InteractionMode } from '@/hooks/useInteractionMode';

// ─────────────────────────────────────────────
// PlayerShell - Shared container for both
// simulation and video players.
// YouTube-like: works inline AND fullscreen.
// ZERO difference between modes except size.
// ─────────────────────────────────────────────

interface PlayerShellProps {
  /** Subject tag + chapter info for top bar */
  topBar: {
    subject: 'physics' | 'chemistry' | 'biology' | 'math' | 'higher-math' | 'english';
    chapter: number;
    title: string;
  };
  /** Pan/zoom controls (simulation only, optional for video) */
  panZoom?: PanZoomControls;
  /** Interaction mode state (simulation only) */
  interactionMode?: {
    effectiveMode: InteractionMode;
    setMouseMode: () => void;
    setHandMode: () => void;
  };
  /** Sound toggle (TTS narration) */
  sound?: {
    enabled: boolean;
    toggle: () => void;
  };
  /** Cursor style */
  cursor?: string;
  /** Main content area (canvas or video) */
  children: ReactNode;
  /** Fixed overlay content (control panels, readouts) */
  overlay?: ReactNode;
}

const SUBJECT_COLORS: Record<string, string> = {
  physics: 'bg-physics',
  chemistry: 'bg-chemistry',
  biology: 'bg-biology',
  math: 'bg-subject-math',
  'higher-math': 'bg-subject-higher-math',
  english: 'bg-subject-english',
};

const SUBJECT_LABELS: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'সাধারণ গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

export default function PlayerShell({
  topBar,
  panZoom,
  interactionMode,
  sound,
  cursor = 'default',
  children,
  overlay,
}: PlayerShellProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(playerRef);
  const router = useRouter();

  // Keep latest fitToScreen in a ref so the ResizeObserver effect can be
  // mount-only (otherwise we'd recreate the observer on every panZoom render,
  // and the observer fires immediately on observe(), which resets the user's
  // pan position - that was the "snap-back-while-panning" bug).
  const fitToScreenRef = useRef(panZoom?.fitToScreen);
  useEffect(() => {
    fitToScreenRef.current = panZoom?.fitToScreen;
  });

  // Auto-fit on actual size changes only (fullscreen toggle, orientation
  // change, container resize). We compare dimensions and only re-fit when
  // they actually change, so transient layout passes don't reset the pan.
  useEffect(() => {
    if (!playerRef.current) return;
    const el = playerRef.current;
    let lastW = 0;
    let lastH = 0;
    let rafId = 0;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      const w = Math.round(cr.width);
      const h = Math.round(cr.height);
      // Significant change only (>2px) - ignore subpixel jitter
      if (Math.abs(w - lastW) < 3 && Math.abs(h - lastH) < 3) return;
      lastW = w;
      lastH = h;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        fitToScreenRef.current?.();
      });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []); // mount-only

  // Explicit re-fit on fullscreen change - WebView sometimes lags ResizeObserver
  useEffect(() => {
    const t1 = setTimeout(() => fitToScreenRef.current?.(), 180);
    const t2 = setTimeout(() => fitToScreenRef.current?.(), 450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isFullscreen]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/simulations');
    }
  };

  return (
    <div
      ref={playerRef}
      className="suttro-player flex flex-col select-none"
      style={{ cursor }}
    >
      {/* ── Top Bar ── */}
      <div
        className="suttro-player-topbar flex items-center justify-between gap-2 px-2 sm:px-4 py-2 shrink-0"
        style={{
          background: 'var(--player-topbar)',
          borderBottom: '1px solid var(--player-border)',
        }}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Back button - visible on mobile inline, and inside fullscreen on all devices */}
          <button
            onClick={handleBack}
            className={`tappable shrink-0 w-9 h-9 -ml-1 rounded-full flex items-center justify-center hover:bg-white/10 suttro-transition ${
              isFullscreen ? 'flex' : 'flex lg:hidden'
            }`}
            style={{ color: 'var(--player-text)' }}
            aria-label="পেছনে যাও"
            title="পেছনে যাও"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <span
            className={`${SUBJECT_COLORS[topBar.subject]} shrink-0 px-2 py-0.5 rounded text-[11px] sm:text-xs text-white font-medium whitespace-nowrap`}
          >
            <span className="hidden sm:inline">{SUBJECT_LABELS[topBar.subject]} · </span>
            অধ্যায় {topBar.chapter}
          </span>
          <span
            className="text-xs sm:text-sm truncate"
            style={{ color: 'var(--player-text)' }}
          >
            {topBar.title}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {sound && (
            <button
              onClick={sound.toggle}
              className="p-2 rounded hover:bg-white/10 suttro-transition text-sm"
              style={{ color: sound.enabled ? 'var(--player-text)' : 'var(--player-muted)' }}
              title={sound.enabled ? 'শব্দ বন্ধ করো' : 'শব্দ চালু করো'}
            >
              {sound.enabled ? '🔊' : '🔇'}
            </button>
          )}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded hover:bg-white/10 suttro-transition"
            style={{ color: 'var(--player-muted)' }}
            title={isFullscreen ? 'ফুলস্ক্রিন থেকে বের হও' : 'ফুলস্ক্রিন'}
          >
            ⛶
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="relative flex-1 overflow-hidden" style={{ contain: 'paint' }}>
        {children}

        {/* Fixed overlay (control panels, readouts) */}
        {overlay && <div className="fixed-overlay">{overlay}</div>}
      </div>

      {/* ── Bottom Toolbar ── */}
      <BottomToolbar
        panZoom={panZoom}
        interactionMode={interactionMode}
        onToggleFullscreen={toggleFullscreen}
      />
    </div>
  );
}
