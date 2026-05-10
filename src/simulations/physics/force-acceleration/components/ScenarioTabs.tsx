'use client';

import { SCENARIOS } from '../physics';
import type { ScenarioKey } from '../types';

interface Props {
  current: ScenarioKey;
  onChange: (s: ScenarioKey) => void;
}

const ORDER: ScenarioKey[] = ['cartPush', 'momentum', 'impulse', 'weight', 'forceTypes'];

export default function ScenarioTabs({ current, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
      {ORDER.map((key) => {
        const meta = SCENARIOS[key];
        const active = key === current;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex-shrink-0 px-2.5 lg:px-4 py-1 lg:py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-1"
            style={{
              background: active ? '#16A34A' : '#F1F5F9',
              color: active ? '#FFFFFF' : '#475569',
              border: `1px solid ${active ? '#16A34A' : '#E2E8F0'}`,
              boxShadow: active ? '0 2px 6px rgba(22, 163, 74, 0.3)' : 'none',
            }}
            title={meta.description}
          >
            <span style={{ fontSize: '14px' }}>{meta.emoji}</span>
            <span>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
