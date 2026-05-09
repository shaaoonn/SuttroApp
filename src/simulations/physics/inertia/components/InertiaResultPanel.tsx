'use client';

import { SCENARIOS, stoppingDistance, stoppingTime, vehiclePosAt, vehicleVelAt } from '../physics';
import type { InertiaVars, ScenarioKey } from '../types';

interface Props {
  scenario: ScenarioKey;
  values: InertiaVars;
  liveTime: number;
}

/**
 * Result panel — shows live computed values relevant to the current scenario.
 */
export default function InertiaResultPanel({ scenario, values, liveTime }: Props) {
  const meta = SCENARIOS[scenario];
  const liveV = vehicleVelAt(values.u, values.a, liveTime);
  const liveS = vehiclePosAt(values.u, values.a, liveTime);
  const tStop = stoppingTime(values.u, values.a);
  const sStop = stoppingDistance(values.u, values.a);

  return (
    <div
      className="rounded-xl p-3 space-y-1.5"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span style={{ fontSize: '16px' }}>{meta.emoji}</span>
        <div>
          <div className="text-sm font-bold" style={{ color: '#1E293B' }}>
            {meta.label}
          </div>
          <div className="text-[10px]" style={{ color: '#64748B' }}>
            {meta.description}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs pt-1 border-t" style={{ borderColor: '#F1F5F9' }}>
        <Row label="সময় t" value={`${liveTime.toFixed(2)} s`} color="#475569" />
        <Row label="বেগ v" value={`${liveV.toFixed(2)} m/s`} color="#16A34A" />
        {scenario !== 'spaceObject' && (
          <Row label="সরণ s" value={`${liveS.toFixed(2)} m`} color="#475569" />
        )}
        {scenario === 'busBrake' && Number.isFinite(tStop) && (
          <>
            <Row label="থামার সময়" value={`${tStop.toFixed(2)} s`} color="#EA580C" />
            <Row label="থামার দূরত্ব" value={`${sStop.toFixed(2)} m`} color="#EA580C" />
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span style={{ color: '#94A3B8' }}>{label}:</span>
      <span className="font-mono font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}
