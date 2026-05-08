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

export default function VehiclePicker({ current, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1 px-1">
      {VEHICLES.map((v) => {
        const active = v.key === current;
        return (
          <button
            key={v.key}
            onClick={() => onChange(v.key)}
            className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
            style={{
              background: active
                ? 'rgba(42, 157, 110, 0.18)'
                : 'rgba(255, 255, 255, 0.05)',
              color: active ? '#FFFFFF' : 'rgba(250, 251, 249, 0.75)',
              border: active
                ? '1px solid rgba(42, 157, 110, 0.55)'
                : '1px solid rgba(255, 255, 255, 0.1)',
            }}
            title={v.label}
            aria-pressed={active}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>{v.emoji}</span>
            <span className="hidden md:inline">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
