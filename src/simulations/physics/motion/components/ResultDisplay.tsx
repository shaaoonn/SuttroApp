'use client';

import type { MotionState, ValidationError, VariableKey } from '../types';

interface Props {
  liveTime: number;
  liveV: number;
  liveS: number;
  unknown: VariableKey | null;
  values: MotionState['values'];
  lastResult: MotionState['lastResult'];
  error: ValidationError | null;
  mode: MotionState['mode'];
  distanceUnit?: 'm' | 'cm';
}

const baseVarUnit: Record<VariableKey, string> = {
  u: 'm/s',
  v: 'm/s',
  a: 'm/s²',
  s: 'm',
  t: 's',
};
function varUnit(k: VariableKey, du: 'm' | 'cm'): string {
  if (k === 's' && du === 'cm') return 'cm';
  return baseVarUnit[k];
}

const VAR_LABEL_BN: Record<VariableKey, string> = {
  u: 'আদিবেগ',
  v: 'বেগ',
  a: 'ত্বরণ',
  s: 'সরণ',
  t: 'সময়',
};

const fmt = (n: number) => {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1000) return n.toFixed(0);
  return n.toFixed(2);
};

export default function ResultDisplay({
  liveTime,
  liveV,
  liveS,
  unknown,
  lastResult,
  error,
  mode,
  distanceUnit = 'm',
}: Props) {
  // Display value for `s` field — multiply by 100 if cm mode
  const displayLiveS = distanceUnit === 'cm' ? liveS * 100 : liveS;
  // Display value for solver result if it's `s` — same conversion
  const displayResultValue =
    lastResult && unknown === 's' && distanceUnit === 'cm'
      ? lastResult.value * 100
      : lastResult?.value;
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-[10px]" style={{ color: '#94A3B8' }}>সময় t</div>
          <div className="font-mono font-bold text-sm" style={{ color: '#1E293B' }}>
            {fmt(liveTime)}s
          </div>
        </div>
        <div>
          <div className="text-[10px]" style={{ color: '#94A3B8' }}>বেগ v</div>
          <div className="font-mono font-bold text-sm" style={{ color: '#16A34A' }}>
            {fmt(liveV)} m/s
          </div>
        </div>
        <div>
          <div className="text-[10px]" style={{ color: '#94A3B8' }}>সরণ s</div>
          <div className="font-mono font-bold text-sm" style={{ color: '#1E293B' }}>
            {fmt(displayLiveS)} {distanceUnit}
          </div>
        </div>
      </div>

      {/* Solver result */}
      {mode === 'solver' && (
        <div
          className="mt-2 pt-2 border-t flex items-baseline gap-1.5"
          style={{ borderColor: '#F1F5F9' }}
        >
          <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>
            ফলাফল:
          </span>
          {error ? (
            <span className="text-xs" style={{ color: '#DC2626' }}>
              ⚠ {error.message}
            </span>
          ) : lastResult && unknown ? (
            <span
              className="font-mono text-base font-bold"
              style={{ color: '#D97706' }}
            >
              {unknown} = {fmt(displayResultValue ?? lastResult.value)} {varUnit(unknown, distanceUnit)}
            </span>
          ) : unknown ? (
            <span className="text-xs italic" style={{ color: '#CBD5E1' }}>
              {VAR_LABEL_BN[unknown]} solve হবে…
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
