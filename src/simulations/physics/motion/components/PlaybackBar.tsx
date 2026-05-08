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
      className="rounded-xl px-3 py-2 flex items-center gap-2 flex-wrap"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="px-4 py-1.5 rounded-lg font-bold text-sm transition-all flex items-center gap-1.5"
        style={{
          background: isPlaying
            ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
            : 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
          color: '#FFFFFF',
          boxShadow: isPlaying
            ? '0 2px 8px rgba(245, 158, 11, 0.4)'
            : '0 2px 8px rgba(22, 163, 74, 0.4)',
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
        className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
        style={{
          background: '#F1F5F9',
          color: '#475569',
          border: '1px solid #E2E8F0',
        }}
      >
        <span style={{ fontSize: '12px' }}>↺</span> Reset
      </button>

      <div className="flex-1" />

      {/* Speed picker */}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>
          গতি:
        </span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold transition-all"
            style={{
              background: s === speed ? '#3B82F6' : '#F1F5F9',
              color: s === speed ? '#FFFFFF' : '#475569',
              border: '1px solid',
              borderColor: s === speed ? '#3B82F6' : '#E2E8F0',
            }}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Ghost button */}
      <div className="flex items-center gap-1 ml-1">
        <button
          onClick={onSaveGhost}
          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
          style={{
            background: '#FCE7F3',
            color: '#BE185D',
            border: '1px solid #FBCFE8',
          }}
          title="বর্তমান run ghost-এ সংরক্ষণ"
        >
          + Ghost ({ghostCount})
        </button>
        {ghostCount > 0 && (
          <button
            onClick={onClearGhosts}
            className="text-[11px] px-1.5 py-1 transition-all"
            style={{ color: '#DC2626' }}
            title="Ghost মুছে দাও"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
