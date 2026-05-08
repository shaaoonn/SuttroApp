'use client';

import type { PlaybackSpeed } from '../types';

interface Props {
  speed: PlaybackSpeed;
  onSpeedChange: (s: PlaybackSpeed) => void;
  onSaveGhost: () => void;
  ghostCount: number;
  onClearGhosts: () => void;
}

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2];

/**
 * Speed picker + ghost compare button row.
 * Play/Reset are now overlaid on the scene canvas (SceneOverlayControls).
 */
export default function PlaybackBar({
  speed,
  onSpeedChange,
  onSaveGhost,
  ghostCount,
  onClearGhosts,
}: Props) {
  return (
    <div
      className="rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 flex-wrap"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
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

      <div className="flex-1" />

      {/* Ghost compare */}
      <div className="flex items-center gap-1">
        <button
          onClick={onSaveGhost}
          className="px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all"
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
            className="text-[11px] px-1.5 py-0.5 transition-all"
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
