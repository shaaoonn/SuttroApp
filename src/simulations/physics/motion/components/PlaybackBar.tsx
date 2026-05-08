'use client';

import type { PlaybackSpeed, PlaybackStatus } from '../types';

interface Props {
  status: PlaybackStatus;
  speed: PlaybackSpeed;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (s: PlaybackSpeed) => void;
  onSaveGhost: () => void;
  ghostCount: number;
  onClearGhosts: () => void;
}

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2];

export default function PlaybackBar({
  status,
  speed,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
  onSaveGhost,
  ghostCount,
  onClearGhosts,
}: Props) {
  const isPlaying = status === 'playing';
  return (
    <div
      className="rounded-xl px-3 py-2.5 flex items-center gap-2 flex-wrap"
      style={{
        background: 'rgba(11, 29, 58, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="px-4 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center gap-1.5"
        style={{
          background: isPlaying ? '#E8A838' : '#2A9D6E',
          color: '#FFFFFF',
        }}
      >
        {isPlaying ? (
          <>
            <span style={{ fontSize: '12px' }}>❚❚</span> Pause
          </>
        ) : (
          <>
            <span style={{ fontSize: '12px' }}>▶</span> Play
          </>
        )}
      </button>

      <button
        onClick={onReset}
        className="px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          color: 'rgba(250, 251, 249, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span style={{ fontSize: '12px' }}>↺</span> Reset
      </button>

      <div className="flex-1" />

      {/* Speed picker */}
      <div className="flex items-center gap-1">
        <span
          className="text-[10px]"
          style={{ color: 'rgba(250, 251, 249, 0.55)' }}
        >
          গতি:
        </span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className="px-1.5 py-0.5 rounded text-[11px] font-mono transition-all"
            style={{
              background:
                s === speed ? 'rgba(42, 157, 110, 0.2)' : 'transparent',
              color: s === speed ? '#2A9D6E' : 'rgba(250, 251, 249, 0.6)',
              border:
                s === speed
                  ? '1px solid rgba(42, 157, 110, 0.4)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Ghost button */}
      <div className="flex items-center gap-1 ml-2">
        <button
          onClick={onSaveGhost}
          className="px-2 py-1 rounded text-[11px] transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            color: 'rgba(250, 251, 249, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
          title="বর্তমান run ghost-এ সংরক্ষণ করো"
        >
          + Ghost ({ghostCount})
        </button>
        {ghostCount > 0 && (
          <button
            onClick={onClearGhosts}
            className="text-[11px] px-1.5 py-1 transition-all"
            style={{ color: 'rgba(248, 113, 113, 0.85)' }}
            title="Ghost মুছে দাও"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
