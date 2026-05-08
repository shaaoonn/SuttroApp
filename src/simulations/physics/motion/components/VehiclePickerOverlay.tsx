'use client';

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
 * (top-left). Compact, tappable. Hover/active reveals label below.
 */
export default function VehiclePickerOverlay({ current, onChange }: Props) {
  return (
    <div
      className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 rounded-xl p-1.5"
      style={{
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
      }}
    >
      {VEHICLES.map((v) => {
        const active = v.key === current;
        return (
          <button
            key={v.key}
            onClick={() => onChange(v.key)}
            className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110"
            style={{
              background: active ? '#16A34A' : 'transparent',
              boxShadow: active ? '0 2px 8px rgba(22, 163, 74, 0.4)' : 'none',
              cursor: 'pointer',
            }}
            title={v.label}
            aria-label={v.label}
            aria-pressed={active}
          >
            <span className="text-base lg:text-xl" style={{ lineHeight: 1 }}>{v.emoji}</span>
          </button>
        );
      })}
    </div>
  );
}
