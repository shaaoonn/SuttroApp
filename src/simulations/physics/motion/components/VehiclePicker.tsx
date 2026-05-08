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
  { key: 'ball', emoji: '⚪', label: 'বল' },
];

export default function VehiclePicker({ current, onChange }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
      {VEHICLES.map((v) => {
        const active = v.key === current;
        return (
          <button
            key={v.key}
            onClick={() => onChange(v.key)}
            className="flex-shrink-0 px-2 py-1 rounded-lg text-xs transition-all flex items-center gap-1"
            style={{
              background: active ? 'rgba(42, 157, 110, 0.15)' : 'transparent',
              color: active ? '#2A9D6E' : 'rgba(250, 251, 249, 0.65)',
              border: active
                ? '1px solid rgba(42, 157, 110, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.08)',
            }}
            title={v.label}
          >
            <span style={{ fontSize: '14px' }}>{v.emoji}</span>
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
