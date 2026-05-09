'use client';

import { useEffect, useState } from 'react';
import { SCENARIO_PRESETS } from '../physics';
import type { InertiaVars, ScenarioKey } from '../types';

interface Props {
  scenario: ScenarioKey;
  values: InertiaVars;
}

/**
 * Display the matching textbook question text when current values match
 * a preset (within rounding tolerance). Otherwise show a generic
 * scenario description.
 */
export default function ScenarioQuestion({ scenario, values }: Props) {
  const presets = SCENARIO_PRESETS[scenario];
  const [match, setMatch] = useState<string | null>(null);

  useEffect(() => {
    // Find best matching preset
    const found = presets.find((p) => {
      const v = p.values as InertiaVars;
      return (
        approxEqual(v.m, values.m, 0.5) &&
        approxEqual(v.u, values.u, 0.3) &&
        approxEqual(v.a, values.a, 0.3) &&
        approxEqual(v.mu, values.mu, 0.05)
      );
    });
    setMatch(found ? found.question : null);
  }, [scenario, values, presets]);

  if (!match) {
    // Show a generic description
    const desc = presets[0]?.question;
    if (!desc) return null;
    return (
      <div
        className="rounded-xl p-2.5 text-xs leading-relaxed"
        style={{
          background: '#F8FAFC',
          border: '1px dashed #CBD5E1',
          color: '#64748B',
        }}
      >
        💡 মান বদলে নিজে পরীক্ষা করো — অথবা উপরের 📖 preset bottom থেকে বই-উদাহরণ load করো।
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

function approxEqual(a: number, b: number, tol: number): boolean {
  return Math.abs(a - b) < tol;
}
