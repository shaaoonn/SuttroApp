'use client';

import { EQUATIONS } from '../physics';
import type { EquationKey } from '../types';

interface Props {
  current: EquationKey;
  onChange: (e: EquationKey) => void;
}

const TABS: { key: EquationKey; label: string; color: string }[] = [
  { key: 'first',    label: '১ম সূত্র',   color: '#16A34A' },
  { key: 'second',   label: '২য় সূত্র',  color: '#3B82F6' },
  { key: 'third',    label: '৩য় সূত্র',  color: '#8B5CF6' },
  { key: 'fourth',   label: 'গড়বেগ',     color: '#EC4899' },
  { key: 'freefall', label: 'মুক্ত পতন', color: '#F59E0B' },
];

export default function EquationTabs({ current, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar items-center">
      {TABS.map((tab) => {
        const active = tab.key === current;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap"
            style={{
              background: active ? tab.color : '#FFFFFF',
              color: active ? '#FFFFFF' : '#475569',
              border: active ? `1.5px solid ${tab.color}` : '1.5px solid #E2E8F0',
              boxShadow: active ? `0 2px 8px ${tab.color}40` : '0 1px 2px rgba(0,0,0,0.05)',
            }}
            aria-pressed={active}
          >
            {tab.label}
          </button>
        );
      })}
      <span
        className="text-xs italic font-mono pl-2 whitespace-nowrap hidden sm:inline"
        style={{ color: '#94A3B8' }}
      >
        ({EQUATIONS[current].base})
      </span>
    </div>
  );
}
