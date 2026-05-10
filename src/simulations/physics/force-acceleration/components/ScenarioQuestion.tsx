'use client';

import { useEffect, useState } from 'react';
import { SCENARIO_PRESETS } from '../physics';
import type { ForceVars, ScenarioKey } from '../types';

interface Props {
  scenario: ScenarioKey;
  values: ForceVars;
}

export default function ScenarioQuestion({ scenario, values }: Props) {
  const presets = SCENARIO_PRESETS[scenario];
  const [match, setMatch] = useState<string | null>(null);

  useEffect(() => {
    const found = presets.find((p) => {
      const v = p.values as ForceVars;
      return matchVars(v, values);
    });
    setMatch(found ? found.question : null);
  }, [scenario, values, presets]);

  if (presets.length === 0) return null;

  if (!match) {
    return (
      <div
        className="rounded-xl p-2.5 text-xs leading-relaxed"
        style={{
          background: '#F8FAFC',
          border: '1px dashed #CBD5E1',
          color: '#64748B',
        }}
      >
        💡 মান বদলে নিজে পরীক্ষা করো — অথবা উপরের 📖 preset button থেকে বই উদাহরণ load করো।
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-3 text-xs leading-relaxed"
      style={{
        background: '#FEF3C7',
        border: '1px solid #FDE68A',
        color: '#92400E',
      }}
    >
      <div className="font-bold mb-1 flex items-center gap-1">
        <span>📖</span>
        <span>পাঠ্যবই / SSC প্রশ্ন</span>
      </div>
      <div>{match}</div>
    </div>
  );
}

function matchVars(preset: ForceVars, current: ForceVars): boolean {
  // Check all defined preset fields with tolerance
  const tol = (a: number, b: number, t: number) => Math.abs(a - b) < t;
  if (preset.F !== undefined && !tol(preset.F, current.F, 2)) return false;
  if (preset.m !== undefined && !tol(preset.m, current.m, Math.max(0.5, current.m * 0.05))) return false;
  if (preset.mu !== undefined && !tol(preset.mu, current.mu, 0.05)) return false;
  if (preset.u !== undefined && !tol(preset.u, current.u, 1)) return false;
  if (preset.v !== undefined && !tol(preset.v, current.v, 1)) return false;
  if (preset.t !== undefined && !tol(preset.t, current.t, 0.05)) return false;
  if (preset.g !== undefined && !tol(preset.g, current.g, 0.1)) return false;
  return true;
}
