'use client';

import { useRef, useState, useCallback } from 'react';
import { motionConfig } from '../config';
import type { KinematicVars, Mode, VariableKey } from '../types';

interface Props {
  values: KinematicVars;
  mode: Mode;
  unknown: VariableKey | null;
  activeVars: VariableKey[];
  onChange: (key: VariableKey, value: number) => void;
  /** UI text-size scale (1.0 default). Applied via CSS zoom. */
  textScale?: number;
}

const VAR_COLORS: Record<VariableKey, { fill: string; thumb: string; bg: string }> = {
  u: { fill: '#16A34A', thumb: '#15803D', bg: '#DCFCE7' },
  v: { fill: '#3B82F6', thumb: '#1D4ED8', bg: '#DBEAFE' },
  a: { fill: '#EA580C', thumb: '#C2410C', bg: '#FFEDD5' },
  s: { fill: '#8B5CF6', thumb: '#6D28D9', bg: '#EDE9FE' },
  t: { fill: '#EC4899', thumb: '#BE185D', bg: '#FCE7F3' },
};

/** Compact vertical slider — Master Sab style — for embedding in canvas */
export default function EmbeddedSliders({
  values,
  mode,
  unknown,
  activeVars,
  onChange,
  textScale = 1.0,
}: Props) {
  const visibleVars: VariableKey[] = (['u', 'v', 'a', 's', 't'] as VariableKey[]).filter(
    (v) => activeVars.includes(v) || (mode === 'solver' && unknown === v),
  );

  return (
    <div
      className="absolute top-2 right-2 z-10 flex flex-col rounded-xl"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
        padding: '8px 6px',
        zoom: textScale,
      }}
    >
      <div className="flex gap-1">
        {visibleVars.map((key) => {
          const cfg = motionConfig.variables.find((c) => c.id === key)!;
          const isUnknown = mode === 'solver' && unknown === key;
          return (
            <SliderColumn
              key={key}
              varKey={key}
              value={values[key]}
              min={cfg.min}
              max={cfg.max}
              step={cfg.step}
              isUnknown={isUnknown}
              onChange={(v) => onChange(key, v)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SliderColumn({
  varKey,
  value,
  min,
  max,
  step,
  isUnknown,
  onChange,
}: {
  varKey: VariableKey;
  value: number;
  min: number;
  max: number;
  step: number;
  isUnknown: boolean;
  onChange: (v: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const colors = VAR_COLORS[varKey];
  const TRACK_HEIGHT = 70;
  const ratio = (value - min) / (max - min);

  const updateFromPointer = useCallback(
    (clientY: number) => {
      const t = trackRef.current;
      if (!t) return;
      const rect = t.getBoundingClientRect();
      const y = clientY - rect.top;
      const r = 1 - Math.max(0, Math.min(1, y / rect.height));
      let next = min + (max - min) * r;
      if (step) next = Math.round(next / step) * step;
      onChange(next);
    },
    [min, max, step, onChange],
  );

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: '32px' }}>
      {/* Vertical slider track */}
      <div
        ref={trackRef}
        className="relative cursor-pointer touch-none select-none"
        style={{ width: '20px', height: `${TRACK_HEIGHT}px` }}
        onPointerDown={(e) => {
          if (isUnknown) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
          updateFromPointer(e.clientY);
        }}
        onPointerMove={(e) => {
          if (dragging && !isUnknown) updateFromPointer(e.clientY);
        }}
        onPointerUp={(e) => {
          e.currentTarget.releasePointerCapture(e.pointerId);
          setDragging(false);
        }}
      >
        {/* track background */}
        <div
          className="absolute inset-x-0 inset-y-0 rounded-full mx-auto"
          style={{
            background: isUnknown ? '#FEF3C7' : '#E2E8F0',
            width: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
        {/* fill */}
        {!isUnknown && (
          <div
            className="absolute rounded-full"
            style={{
              background: colors.fill,
              width: '4px',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              height: `${ratio * 100}%`,
            }}
          />
        )}
        {/* thumb */}
        {!isUnknown && (
          <div
            className="absolute rounded-full shadow-md"
            style={{
              background: colors.thumb,
              border: '2px solid #FFFFFF',
              width: '14px',
              height: '14px',
              left: '50%',
              transform: 'translate(-50%, 50%)',
              bottom: `${ratio * 100}%`,
            }}
          />
        )}
        {isUnknown && (
          <div
            className="absolute inset-0 flex items-center justify-center font-bold"
            style={{ color: '#D97706', fontSize: '14px' }}
          >
            ?
          </div>
        )}
      </div>

      {/* value box */}
      <div
        className="rounded text-center font-mono font-bold w-full"
        style={{
          background: isUnknown ? '#FEF3C7' : colors.bg,
          color: isUnknown ? '#D97706' : colors.thumb,
          fontSize: '9px',
          padding: '1px 2px',
          minWidth: '32px',
          border: isUnknown ? '1px solid #F59E0B' : `1px solid ${colors.fill}33`,
        }}
      >
        {isUnknown ? '?' : formatCompact(value)}
      </div>

      {/* label */}
      <div
        className="font-mono font-bold"
        style={{
          color: isUnknown ? '#D97706' : colors.thumb,
          fontSize: '11px',
          lineHeight: 1,
        }}
      >
        {varKey}
      </div>
    </div>
  );
}

function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1000) return n.toFixed(0);
  if (Math.abs(n) >= 100) return n.toFixed(1);
  return n.toFixed(2);
}
