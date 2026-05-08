'use client';

import type { VariableKey } from '../types';

interface Props {
  varKey: VariableKey;
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  isUnknown?: boolean;
  isHighlighted?: boolean;
  onChange: (v: number) => void;
}

const formatValue = (n: number): string => {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) < 0.01 && n !== 0) return n.toExponential(2);
  return n.toFixed(2);
};

export default function ValueSlider({
  label,
  unit,
  value,
  min,
  max,
  step,
  isUnknown = false,
  isHighlighted = false,
  onChange,
}: Props) {
  return (
    <div
      className="rounded-xl px-3 py-3 transition-colors"
      style={{
        background: isHighlighted
          ? 'rgba(232, 168, 56, 0.12)'
          : 'rgba(255, 255, 255, 0.04)',
        border: isHighlighted
          ? '1px solid rgba(232, 168, 56, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex items-baseline justify-between mb-1.5">
        <span
          className="text-xs font-medium opacity-70"
          style={{ color: '#FAFBF9' }}
        >
          {label}
        </span>
        <span
          className="font-mono text-xs opacity-50"
          style={{ color: '#FAFBF9' }}
        >
          {unit}
        </span>
      </div>
      <div
        className="font-mono font-bold mb-2 leading-none"
        style={{
          color: isUnknown
            ? '#E8A838'
            : isHighlighted
              ? '#E8A838'
              : '#FAFBF9',
          fontSize: '20px',
        }}
      >
        {isUnknown ? '?' : formatValue(value)}
      </div>
      {!isUnknown && (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
          style={{ accentColor: '#2A9D6E' }}
        />
      )}
      {isUnknown && (
        <div
          className="text-[10px] opacity-60 italic"
          style={{ color: '#FAFBF9' }}
        >
          সমাধান করো
        </div>
      )}
    </div>
  );
}
