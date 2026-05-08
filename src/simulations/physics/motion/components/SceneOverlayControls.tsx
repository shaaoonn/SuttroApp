'use client';

import type { PlaybackStatus } from '../types';

interface Props {
  status: PlaybackStatus;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
}

/**
 * Floating Play/Pause + Reset controls anchored to the bottom-center
 * of the scene canvas. Frosted glass pills, prominent & teen-friendly.
 */
export default function SceneOverlayControls({
  status,
  onPlay,
  onPause,
  onReset,
}: Props) {
  const isPlaying = status === 'playing';

  return (
    <div
      className="absolute left-1/2 z-10 flex items-center gap-2 rounded-full p-1.5"
      style={{
        bottom: '14px',
        transform: 'translateX(-50%)',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.7)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.18)',
      }}
    >
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="rounded-full font-bold transition-all flex items-center justify-center gap-1.5 hover:scale-105"
        style={{
          width: '48px',
          height: '48px',
          background: isPlaying
            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
            : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          color: '#FFFFFF',
          boxShadow: isPlaying
            ? '0 3px 10px rgba(245, 158, 11, 0.5)'
            : '0 3px 10px rgba(22, 163, 74, 0.5)',
          fontSize: '18px',
          paddingLeft: isPlaying ? 0 : '3px',
        }}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>

      <button
        onClick={onReset}
        className="rounded-full font-bold transition-all flex items-center justify-center hover:scale-105"
        style={{
          width: '40px',
          height: '40px',
          background: '#F1F5F9',
          color: '#475569',
          border: '1px solid #E2E8F0',
          fontSize: '16px',
        }}
        aria-label="Reset"
        title="Reset"
      >
        ↺
      </button>
    </div>
  );
}
