'use client';

import { useEffect, useState } from 'react';
import type { PlaybackStatus } from '../types';

interface Props {
  status: PlaybackStatus;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  ghostCount: number;
  onSaveGhost: () => void;
  onClearGhosts: () => void;
}

/**
 * Floating control pill anchored to BOTTOM-RIGHT of the scene canvas.
 *
 * Buttons (left → right):
 *   [Play / Pause] [Reset] [Zoom −] [Zoom +] [Fullscreen / exit] [Ghost]
 *
 * Speed control was REMOVED per user feedback — animation always plays at
 * 1× real time, matching the wall clock.
 *
 * Sizes scale down on narrow viewports so the pill doesn't crowd the
 * vehicle / distance markers underneath.
 */
export default function SceneOverlayControls({
  status,
  onPlay,
  onPause,
  onReset,
  zoom,
  onZoomChange,
  onToggleFullscreen,
  isFullscreen,
  ghostCount,
  onSaveGhost,
  onClearGhosts,
}: Props) {
  const isPlaying = status === 'playing';

  // Compact button sizes when in narrow viewport (mobile portrait or
  // mobile-landscape fullscreen). Avoids covering the distance markers
  // and football-emoji at the bottom of the vehicle picker.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Sizes
  const playSize = compact ? 36 : 44;
  const btnSize = compact ? 28 : 34;

  return (
    <div
      className="absolute z-10 flex items-center rounded-full"
      style={{
        right: compact ? '8px' : '14px',
        bottom: compact ? '8px' : '14px',
        gap: compact ? '4px' : '6px',
        padding: compact ? '4px' : '6px',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
      }}
    >
      {/* Play / Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="rounded-full font-bold transition-all flex items-center justify-center hover:scale-105"
        style={{
          width: `${playSize}px`,
          height: `${playSize}px`,
          background: isPlaying
            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
            : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          color: '#FFFFFF',
          boxShadow: isPlaying
            ? '0 3px 10px rgba(245, 158, 11, 0.5)'
            : '0 3px 10px rgba(22, 163, 74, 0.5)',
          fontSize: compact ? '14px' : '16px',
          paddingLeft: isPlaying ? 0 : '2px',
        }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>

      {/* Reset */}
      <CircleBtn size={btnSize} onClick={onReset} title="Reset" color="#475569">
        <span style={{ fontSize: compact ? '13px' : '15px' }}>↺</span>
      </CircleBtn>

      <Divider compact={compact} />

      {/* Zoom out */}
      <CircleBtn
        size={btnSize}
        onClick={() => onZoomChange(zoom - 0.25)}
        title="Zoom out"
        color="#475569"
        disabled={zoom <= 0.5}
      >
        <span className="font-bold" style={{ fontSize: compact ? '13px' : '15px' }}>−</span>
      </CircleBtn>

      {/* Zoom in */}
      <CircleBtn
        size={btnSize}
        onClick={() => onZoomChange(zoom + 0.25)}
        title="Zoom in"
        color="#475569"
        disabled={zoom >= 2.5}
      >
        <span className="font-bold" style={{ fontSize: compact ? '13px' : '15px' }}>+</span>
      </CircleBtn>

      <Divider compact={compact} />

      {/* Fullscreen toggle */}
      <CircleBtn
        size={btnSize}
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        color="#8B5CF6"
        active={isFullscreen}
      >
        {isFullscreen ? (
          <svg width={compact ? 12 : 14} height={compact ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 9H5V5M15 9h4V5M15 15h4v4M9 15H5v4" />
          </svg>
        ) : (
          <svg width={compact ? 12 : 14} height={compact ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" />
          </svg>
        )}
      </CircleBtn>

      {/* Ghost */}
      <CircleBtn
        size={btnSize}
        onClick={onSaveGhost}
        title="Save ghost"
        color="#BE185D"
      >
        <span style={{ fontSize: compact ? '12px' : '14px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
          👻
          {ghostCount > 0 && (
            <span style={{ fontSize: compact ? '8px' : '9px', fontWeight: 700 }}>{ghostCount}</span>
          )}
        </span>
      </CircleBtn>

      {ghostCount > 0 && (
        <button
          onClick={onClearGhosts}
          className="text-xs"
          style={{
            color: '#DC2626',
            padding: compact ? '0 4px' : '0 6px',
            fontSize: compact ? '11px' : '13px',
          }}
          title="Clear ghosts"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function CircleBtn({
  size,
  onClick,
  title,
  color,
  disabled,
  active = false,
  children,
}: {
  size: number;
  onClick: () => void;
  title: string;
  color: string;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full flex items-center justify-center transition-all hover:scale-105"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: active ? color : '#F1F5F9',
        color: active ? '#FFFFFF' : color,
        border: `1px solid ${active ? color : '#E2E8F0'}`,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: active ? `0 2px 6px ${color}50` : 'none',
      }}
      title={title}
    >
      {children}
    </button>
  );
}

function Divider({ compact }: { compact: boolean }) {
  return (
    <div
      style={{
        width: '1px',
        height: compact ? '18px' : '22px',
        background: '#E2E8F0',
        margin: compact ? '0 1px' : '0 2px',
      }}
    />
  );
}
