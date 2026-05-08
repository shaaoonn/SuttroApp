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
      className="rounded-xl px-3 py-2.5 transition-all"
      style={{
        background: isUnknown
          ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)'
          : isHighlighted
            ? 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)'
            : '#FFFFFF',
        border: isUnknown
          ? '1.5px solid #F59E0B'
          : isHighlighted
            ? '1.5px solid #3B82F6'
            : '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex items-baseline justify-between mb-1">
        <span
          className="text-xs font-semibold"
          style={{ color: '#475569' }}
        >
          {label}
        </span>
        <span
          className="font-mono text-[10px]"
          style={{ color: '#94A3B8' }}
        >
          {unit}
        </span>
      </div>
      <div
        className="font-mono font-bold mb-1.5 leading-none text-lg lg:text-xl"
        style={{
          color: isUnknown ? '#D97706' : '#1E293B',
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
          style={{ accentColor: '#16A34A' }}
        />
      )}
      {isUnknown && (
        <div
          className="text-[10px] italic"
          style={{ color: '#92400E' }}
        >
          সমাধান করো
        </div>
      )}
    </div>
  );
}
