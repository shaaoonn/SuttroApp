'use client';

import { forceAccelerationConfig } from '../config';
import type { ForceVars, ScenarioKey, VariableKey } from '../types';

interface Props {
  scenario: ScenarioKey;
  values: ForceVars;
  onChange: (key: VariableKey, value: number) => void;
  textScale?: number;
}

const VAR_COLORS: Record<VariableKey, { fill: string; thumb: string; bg: string }> = {
  F:       { fill: '#EA580C', thumb: '#C2410C', bg: '#FFEDD5' },
  m:       { fill: '#16A34A', thumb: '#15803D', bg: '#DCFCE7' },
  mu:      { fill: '#8B5CF6', thumb: '#6D28D9', bg: '#EDE9FE' },
  u:       { fill: '#3B82F6', thumb: '#1D4ED8', bg: '#DBEAFE' },
  v:       { fill: '#0EA5E9', thumb: '#0369A1', bg: '#E0F2FE' },
  t:       { fill: '#EC4899', thumb: '#BE185D', bg: '#FCE7F3' },
  g:       { fill: '#DC2626', thumb: '#B91C1C', bg: '#FEE2E2' },
  pushers: { fill: '#F59E0B', thumb: '#D97706', bg: '#FEF3C7' },
};

export default function ForceSliders({
  scenario,
  values,
  onChange,
  textScale = 1.0,
}: Props) {
  const visibleVars: VariableKey[] = scenarioVars(scenario);

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
          const cfg = forceAccelerationConfig.variables.find((c) => c.id === key);
          if (!cfg) return null;
          return (
            <SliderColumn
              key={key}
              varKey={key}
              value={values[key]}
              min={cfg.min}
              max={cfg.max}
              step={cfg.step}
              onChange={(v) => onChange(key, v)}
            />
          );
        })}
      </div>
    </div>
  );
}

function scenarioVars(s: ScenarioKey): VariableKey[] {
  switch (s) {
    case 'cartPush':
      return ['F', 'm', 'mu', 'pushers'];
    case 'momentum':
      return ['m', 'u'];
    case 'impulse':
      return ['m', 'u', 'v', 't'];
    case 'weight':
      return ['m'];
    case 'forceTypes':
      return [];
  }
}

function SliderColumn({
  varKey,
  value,
  min,
  max,
  step,
  onChange,
}: {
  varKey: VariableKey;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  const colors = VAR_COLORS[varKey];
  const TRACK_HEIGHT = 70;
  const ratio = (value - min) / (max - min);

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: '36px' }}>
      <div
        className="relative cursor-pointer"
        style={{ width: '20px', height: `${TRACK_HEIGHT}px` }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const r = 1 - Math.max(0, Math.min(1, y / rect.height));
          let next = min + (max - min) * r;
          if (step) next = Math.round(next / step) * step;
          onChange(Math.max(min, Math.min(max, next)));
        }}
      >
        <div
          className="absolute mx-auto rounded-full"
          style={{
            background: '#E2E8F0',
            width: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            top: 0,
            bottom: 0,
          }}
        />
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
      </div>
      <input
        type="number"
        value={value.toFixed(step < 1 ? 2 : 0)}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
        className="w-full text-center font-mono rounded-md"
        style={{
          background: colors.bg,
          color: colors.thumb,
          fontSize: '9px',
          padding: '1px 2px',
          border: `1px solid ${colors.fill}33`,
        }}
        step={step}
      />
      <div
        className="font-bold leading-none"
        style={{ color: colors.thumb, fontSize: '11px' }}
      >
        {varKey === 'mu' ? 'μ' : varKey === 'pushers' ? 'N' : varKey}
      </div>
    </div>
  );
}
