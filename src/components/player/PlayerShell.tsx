'use client';

import { useRef, type ReactNode } from 'react';
import { useFullscreen } from '@/hooks/useFullscreen';
import BottomToolbar from './BottomToolbar';
import type { PanZoomControls } from './BottomToolbar';
import type { InteractionMode } from '@/hooks/useInteractionMode';

// ─────────────────────────────────────────────
// PlayerShell — Shared container for both
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

  return (
    <div
      ref={playerRef}
      className="suttro-player flex flex-col select-none"
      style={{ cursor }}
    >
      {/* ── Top Bar ── */}
      <div
        className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{
          background: 'var(--player-topbar)',
          borderBottom: '1px solid var(--player-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className={`${SUBJECT_COLORS[topBar.subject]} px-2 py-0.5 rounded text-xs text-white font-medium`}
          >
            {SUBJECT_LABELS[topBar.subject]} · অধ্যায় {topBar.chapter}
          </span>
          <span className="text-sm" style={{ color: 'var(--player-text)' }}>
            {topBar.title}
          </span>
        </div>
        <div className="flex items-center gap-1">
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
