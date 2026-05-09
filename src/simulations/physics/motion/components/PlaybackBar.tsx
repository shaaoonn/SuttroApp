'use client';

import type { PlaybackSpeed } from '../types';

interface Props {
  speed: PlaybackSpeed;
  onSpeedChange: (s: PlaybackSpeed) => void;
  zoom: number;
  onZoomChange: (z: number) => void;
  onSaveGhost: () => void;
  ghostCount: number;
  onClearGhosts: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2];

/**
 * One row of equal-sized circular buttons:
 *   [0.25×] [0.5×] [1×] [2×]   [➖] [➕]   [⛶]   [👻 n]
 */
export default function PlaybackBar({
  speed,
  onSpeedChange,
  zoom,
  onZoomChange,
  onSaveGhost,
  ghostCount,
  onClearGhosts,
  onToggleFullscreen,
  isFullscreen,
}: Props) {
  return (
    <div
      className="rounded-xl px-2 py-1.5 flex items-center gap-1.5 flex-wrap"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Speed circles */}
      <div className="flex items-center gap-1">
        {SPEEDS.map((s) => (
          <CircleBtn
            key={s}
            active={s === speed}
            color="#3B82F6"
            onClick={() => onSpeedChange(s)}
            title={`${s}× speed`}
          >
            <span className="text-[10px] font-mono font-bold">{s}×</span>
          </CircleBtn>
        ))}
      </div>

      <Divider />

      {/* Zoom */}
      <CircleBtn
        active={false}
        color="#475569"
        onClick={() => onZoomChange(zoom - 0.25)}
        title="Zoom out"
        disabled={zoom <= 0.5}
      >
        <span className="text-base font-bold">−</span>
      </CircleBtn>
      <CircleBtn
        active={false}
        color="#475569"
        onClick={() => onZoomChange(zoom + 0.25)}
        title="Zoom in"
        disabled={zoom >= 2.5}
      >
        <span className="text-base font-bold">+</span>
      </CircleBtn>
      <span
        className="text-[10px] font-mono font-semibold w-7 text-center"
        style={{ color: '#94A3B8' }}
      >
        {zoom.toFixed(1)}×
      </span>

      <Divider />

      {/* Fullscreen */}
      <CircleBtn
        active={isFullscreen}
        color="#8B5CF6"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 9H5V5M15 9h4V5M15 15h4v4M9 15H5v4" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" />
          </svg>
        )}
      </CircleBtn>

      <div className="flex-1 min-w-1" />

      {/* Ghost */}
      <button
        onClick={onSaveGhost}
        className="px-2 py-1 rounded-full text-[11px] font-semibold transition-all flex items-center gap-1"
        style={{
          background: '#FCE7F3',
          color: '#BE185D',
          border: '1px solid #FBCFE8',
          height: '32px',
        }}
        title="Ghost সংরক্ষণ"
      >
        <span style={{ fontSize: '12px' }}>👻</span>
        {ghostCount}
      </button>
      {ghostCount > 0 && (
        <button
          onClick={onClearGhosts}
          className="text-xs px-1.5 py-1"
          style={{ color: '#DC2626' }}
          title="Clear ghosts"
        >
          ✕
        </button>
      )}
    </div>
  );
}

function CircleBtn({
  active,
  color,
  onClick,
  title,
  disabled,
  children,
}: {
  active: boolean;
  color: string;
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full flex items-center justify-center transition-all"
      style={{
        width: '32px',
        height: '32px',
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

function Divider() {
  return <div className="w-px h-6 mx-0.5" style={{ background: '#E2E8F0' }} />;
}
