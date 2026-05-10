'use client';

import {
  accelerationFrom,
  forceFromImpulse,
  impulse,
  momentum,
  netForce,
  weight,
} from '../physics';
import type { ForceVars, ScenarioKey } from '../types';

interface Props {
  scenario: ScenarioKey;
  values: ForceVars;
  liveTime: number;
}

const fmt = (n: number, d = 2) => {
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 10000) return n.toFixed(0);
  return n.toFixed(d);
};

export default function ResultPanel({ scenario, values, liveTime }: Props) {
  return (
    <div
      className="rounded-xl p-3 space-y-1.5"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="text-[10px] mb-1 opacity-60" style={{ color: '#94A3B8' }}>
        🧮 হিসাব-ফলাফল
      </div>

      {scenario === 'cartPush' && (
        <CartPushResult values={values} liveTime={liveTime} />
      )}
      {scenario === 'momentum' && <MomentumResult values={values} />}
      {scenario === 'impulse' && <ImpulseResult values={values} />}
      {scenario === 'weight' && <WeightResult values={values} />}
      {scenario === 'forceTypes' && (
        <p className="text-xs italic" style={{ color: '#94A3B8' }}>
          এই tab-এ কোনো গণনা নাই — concept reference।
        </p>
      )}
    </div>
  );
}

function CartPushResult({ values, liveTime }: { values: ForceVars; liveTime: number }) {
  const a = accelerationFrom(values.F, values.m, values.mu, values.g);
  const fNet = netForce(values.F, values.m, values.mu, values.g);
  const friction = values.mu * values.m * values.g;
  return (
    <div className="space-y-1 text-xs font-mono">
      <Row label="প্রযুক্ত বল F" val={`${fmt(values.F, 0)} N`} color="#EA580C" />
      {values.mu > 0.001 && (
        <Row label="ঘর্ষণ f = μmg" val={`${fmt(friction, 1)} N`} color="#DC2626" />
      )}
      <Row label="net F" val={`${fmt(fNet, 1)} N`} color="#1E293B" />
      <Row label="ভর m" val={`${fmt(values.m, 1)} kg`} color="#16A34A" />
      <div className="border-t pt-1.5 mt-1" style={{ borderColor: '#F1F5F9' }}>
        <Row label="ত্বরণ a = F_net/m" val={`${fmt(a, 2)} m/s²`} color="#D97706" big />
      </div>
      <div className="text-[10px] opacity-60 pt-1" style={{ color: '#94A3B8' }}>
        সময়: {fmt(liveTime, 2)}s
      </div>
    </div>
  );
}

function MomentumResult({ values }: { values: ForceVars }) {
  const p = momentum(values.m, values.u);
  return (
    <div className="space-y-1 text-xs font-mono">
      <Row label="ভর m" val={`${fmt(values.m, 2)} kg`} color="#16A34A" />
      <Row label="বেগ v" val={`${fmt(values.u, 2)} m/s`} color="#3B82F6" />
      <div className="border-t pt-1.5 mt-1" style={{ borderColor: '#F1F5F9' }}>
        <Row label="ভরবেগ p = mv" val={`${fmt(p, 2)} kg·m/s`} color="#D97706" big />
      </div>
    </div>
  );
}

function ImpulseResult({ values }: { values: ForceVars }) {
  const J = impulse(values.m, values.u, values.v);
  const F = forceFromImpulse(values.m, values.u, values.v, values.t);
  return (
    <div className="space-y-1 text-xs font-mono">
      <Row label="ভর m" val={`${fmt(values.m, 3)} kg`} color="#16A34A" />
      <Row label="আদিবেগ u" val={`${fmt(values.u, 1)} m/s`} color="#3B82F6" />
      <Row label="শেষবেগ v" val={`${fmt(values.v, 1)} m/s`} color="#0EA5E9" />
      <Row label="সময় Δt" val={`${fmt(values.t, 3)} s`} color="#EC4899" />
      <div className="border-t pt-1.5 mt-1 space-y-1" style={{ borderColor: '#F1F5F9' }}>
        <Row label="আবেগ J = m(v−u)" val={`${fmt(J, 2)} kg·m/s`} color="#8B5CF6" />
        <Row label="বল F = J/Δt" val={`${fmt(F, 1)} N`} color="#D97706" big />
      </div>
    </div>
  );
}

function WeightResult({ values }: { values: ForceVars }) {
  const W = weight(values.m, values.g);
  return (
    <div className="space-y-1 text-xs font-mono">
      <Row label="ভর m" val={`${fmt(values.m, 1)} kg`} color="#16A34A" />
      <Row label="মহাকর্ষজ ত্বরণ g" val={`${fmt(values.g, 2)} m/s²`} color="#DC2626" />
      <div className="border-t pt-1.5 mt-1" style={{ borderColor: '#F1F5F9' }}>
        <Row label="ওজন W = mg" val={`${fmt(W, 1)} N`} color="#D97706" big />
      </div>
    </div>
  );
}

function Row({
  label,
  val,
  color,
  big,
}: {
  label: string;
  val: string;
  color: string;
  big?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span style={{ color: '#94A3B8', fontSize: big ? '11px' : '10px' }}>{label}</span>
      <span
        className="font-bold"
        style={{
          color,
          fontSize: big ? '14px' : '11px',
        }}
      >
        {val}
      </span>
    </div>
  );
}
