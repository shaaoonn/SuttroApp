'use client';

import type { PlaybackSpeed, PlaybackStatus } from '../types';

interface Props {
  status: PlaybackStatus;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  /** When true, additional controls (speed, zoom, fullscreen-exit) appear next to Play/Reset */
  extended?: boolean;
  speed?: PlaybackSpeed;
  onSpeedChange?: (s: PlaybackSpeed) => void;
  zoom?: number;
  onZoomChange?: (z: number) => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
  /**
   * Layout mode:
   *  - "overlay" (default): floats absolutely at bottom-center INSIDE the canvas
   *  - "bar": static, full-width-of-parent horizontal bar (used in fullscreen)
   */
  mode?: 'overlay' | 'bar';
}

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2];

export default function SceneOverlayControls({
  status,
  onPlay,
  onPause,
  onReset,
  extended = false,
  speed,
  onSpeedChange,
  zoom,
  onZoomChange,
  onToggleFullscreen,
  isFullscreen,
  mode = 'overlay',
}: Props) {
  const isPlaying = status === 'playing';
  const isBar = mode === 'bar';

  // Bar mode: static positioning, full width of parent column
  // Overlay mode: absolute, floating bottom-center inside canvas
  const wrapperStyle: React.CSSProperties = isBar
    ? {
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.08)',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }
    : {
        bottom: '14px',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
        maxWidth: '92vw',
        flexWrap: 'wrap',
        justifyContent: 'center',
      };

  return (
    <div
      className={
        isBar
          ? 'relative z-10 flex items-center gap-1.5 px-3 py-2 w-full'
          : 'absolute left-1/2 z-10 flex items-center gap-1.5 rounded-full p-1.5'
      }
      style={wrapperStyle}
    >
      {/* Play / Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="rounded-full font-bold transition-all flex items-center justify-center hover:scale-105"
        style={{
          width: '44px',
          height: '44px',
          background: isPlaying
            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
            : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          color: '#FFFFFF',
          boxShadow: isPlaying
            ? '0 3px 10px rgba(245, 158, 11, 0.5)'
            : '0 3px 10px rgba(22, 163, 74, 0.5)',
          fontSize: '16px',
          paddingLeft: isPlaying ? 0 : '2px',
        }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="rounded-full font-bold transition-all flex items-center justify-center hover:scale-105"
        style={{
          width: '38px',
          height: '38px',
          background: '#F1F5F9',
          color: '#475569',
          border: '1px solid #E2E8F0',
          fontSize: '15px',
        }}
        aria-label="Reset"
        title="Reset"
      >
        ↺
      </button>

      {/* ─── Extended controls (only in fullscreen) ─── */}
      {extended && speed !== undefined && onSpeedChange && (
        <>
          <Divider />
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
        </>
      )}

      {extended && zoom !== undefined && onZoomChange && (
        <>
          <Divider />
          <CircleBtn
            color="#475569"
            onClick={() => onZoomChange(zoom - 0.25)}
            title="Zoom out"
            disabled={zoom <= 0.5}
          >
            <span className="text-base font-bold">−</span>
          </CircleBtn>
          <CircleBtn
            color="#475569"
            onClick={() => onZoomChange(zoom + 0.25)}
            title="Zoom in"
            disabled={zoom >= 2.5}
          >
            <span className="text-base font-bold">+</span>
          </CircleBtn>
        </>
      )}

      {extended && onToggleFullscreen && (
        <>
          <Divider />
          <CircleBtn
            active={isFullscreen ?? false}
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
        </>
      )}
    </div>
  );
}

function CircleBtn({
  active = false,
  color,
  onClick,
  title,
  disabled,
  children,
}: {
  active?: boolean;
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
