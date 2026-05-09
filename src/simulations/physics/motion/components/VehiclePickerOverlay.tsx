'use client';

import { useEffect, useState } from 'react';
import type { VehicleKey } from '../types';

interface Props {
  current: VehicleKey;
  onChange: (v: VehicleKey) => void;
}

const VEHICLES: { key: VehicleKey; emoji: string; label: string }[] = [
  { key: 'sedan', emoji: '🚗', label: 'গাড়ি' },
  { key: 'motorcycle', emoji: '🏍️', label: 'মোটরসাইকেল' },
  { key: 'cng', emoji: '🛺', label: 'CNG' },
  { key: 'bicycle', emoji: '🚲', label: 'বাইসাইকেল' },
  { key: 'rocket', emoji: '🚀', label: 'রকেট' },
  { key: 'ball', emoji: '⚽', label: 'বল' },
];

/**
 * Floating, icon-only vehicle picker overlaid on the scene canvas
 * (top-left). Compact + scrollable on narrow viewports so all 6 emojis
 * (including the football at the bottom) stay reachable.
 */
export default function VehiclePickerOverlay({ current, onChange }: Props) {
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const check = () => setCompact(window.innerWidth < 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const btnSize = compact ? 26 : 36;
  const emojiFs = compact ? 14 : 20;

  return (
    <div
      className="absolute top-2 left-2 z-10 flex flex-col rounded-xl no-scrollbar"
      style={{
        gap: compact ? '3px' : '5px',
        padding: compact ? '4px' : '6px',
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
        // On narrow viewports the picker can exceed canvas height — make it
        // scrollable so the football at the bottom is reachable.
        maxHeight: 'calc(100% - 16px)',
        overflowY: 'auto',
      }}
    >
      {VEHICLES.map((v) => {
        const active = v.key === current;
        return (
          <button
            key={v.key}
            onClick={() => onChange(v.key)}
            className="rounded-lg flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
            style={{
              width: `${btnSize}px`,
              height: `${btnSize}px`,
              background: active ? '#16A34A' : 'transparent',
              boxShadow: active ? '0 2px 8px rgba(22, 163, 74, 0.4)' : 'none',
              cursor: 'pointer',
            }}
            title={v.label}
            aria-label={v.label}
            aria-pressed={active}
          >
            <span style={{ fontSize: `${emojiFs}px`, lineHeight: 1 }}>{v.emoji}</span>
          </button>
        );
      })}
    </div>
  );
}
