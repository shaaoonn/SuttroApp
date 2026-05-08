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
}

const VAR_LABEL_BN: Record<VariableKey, string> = {
  u: 'আদিবেগ',
  v: 'বেগ',
  a: 'ত্বরণ',
  s: 'সরণ',
  t: 'সময়',
};

const VAR_UNIT: Record<VariableKey, string> = {
  u: 'm/s',
  v: 'm/s',
  a: 'm/s²',
  s: 'm',
  t: 's',
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
}: Props) {
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: 'rgba(11, 29, 58, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <div className="flex items-baseline gap-1.5">
          <span style={{ color: 'rgba(250, 251, 249, 0.55)' }}>সময় t:</span>
          <span className="font-mono font-semibold" style={{ color: '#FAFBF9' }}>
            {fmt(liveTime)}s
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span style={{ color: 'rgba(250, 251, 249, 0.55)' }}>বেগ v:</span>
          <span className="font-mono font-semibold" style={{ color: '#2A9D6E' }}>
            {fmt(liveV)} m/s
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 col-span-2">
          <span style={{ color: 'rgba(250, 251, 249, 0.55)' }}>সরণ s:</span>
          <span className="font-mono font-semibold" style={{ color: '#FAFBF9' }}>
            {fmt(liveS)} m
          </span>
        </div>
      </div>

      {/* Solver result line */}
      {mode === 'solver' && (
        <div
          className="mt-2 pt-2 border-t flex items-baseline gap-1.5 text-sm"
          style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
        >
          <span style={{ color: 'rgba(250, 251, 249, 0.55)', fontSize: '11px' }}>
            ফলাফল:
          </span>
          {error ? (
            <span style={{ color: '#F87171', fontSize: '12px' }}>
              ⚠ {error.message}
            </span>
          ) : lastResult && unknown ? (
            <span className="font-mono" style={{ color: '#E8A838' }}>
              {unknown} = {fmt(lastResult.value)} {VAR_UNIT[unknown]}
            </span>
          ) : unknown ? (
            <span
              className="italic"
              style={{ color: 'rgba(250, 251, 249, 0.4)', fontSize: '11px' }}
            >
              {VAR_LABEL_BN[unknown]} solve হবে…
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
