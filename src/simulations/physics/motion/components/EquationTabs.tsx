'use client';

import { EQUATIONS } from '../physics';
import type { EquationKey } from '../types';

interface Props {
  current: EquationKey;
  onChange: (e: EquationKey) => void;
}

const TABS: { key: EquationKey; label: string }[] = [
  { key: 'first', label: '১ম সূত্র' },
  { key: 'second', label: '২য় সূত্র' },
  { key: 'third', label: '৩য় সূত্র' },
  { key: 'fourth', label: 'গড়বেগ' },
  { key: 'freefall', label: 'মুক্ত পতন' },
];

export default function EquationTabs({ current, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
      {TABS.map((tab) => {
        const active = tab.key === current;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
            style={{
              background: active ? '#2A9D6E' : 'rgba(255, 255, 255, 0.06)',
              color: active ? '#FFFFFF' : 'rgba(250, 251, 249, 0.75)',
              border: active
                ? '1px solid #2A9D6E'
                : '1px solid rgba(255, 255, 255, 0.1)',
            }}
            aria-pressed={active}
          >
            {tab.label}
          </button>
        );
      })}
      <span className="text-[10px] opacity-40 self-center pl-1 whitespace-nowrap" style={{ color: '#FAFBF9' }}>
        ({EQUATIONS[current].base})
      </span>
    </div>
  );
}
