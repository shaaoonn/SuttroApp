'use client';

import type { Mode } from '../types';

interface Props {
  mode: Mode;
  onChange: (m: Mode) => void;
}

export default function ModeSwitch({ mode, onChange }: Props) {
  return (
    <div
      className="inline-flex p-0.5 rounded-full"
      style={{
        background: '#F1F5F9',
        border: '1px solid #E2E8F0',
      }}
    >
      {(['solver', 'explore'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="px-3 py-1 text-xs font-medium rounded-full transition-all"
          style={{
            background: mode === m ? '#16A34A' : 'transparent',
            color: mode === m ? '#FFFFFF' : '#64748B',
            boxShadow: mode === m ? '0 2px 6px rgba(22, 163, 74, 0.35)' : 'none',
          }}
        >
          {m === 'solver' ? 'সমাধানক' : 'অনুসন্ধান'}
        </button>
      ))}
    </div>
  );
}
