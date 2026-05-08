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
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      {(['solver', 'explore'] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="px-3 py-1 text-xs font-medium rounded-full transition-all"
          style={{
            background: mode === m ? '#2A9D6E' : 'transparent',
            color: mode === m ? '#FFFFFF' : 'rgba(250, 251, 249, 0.7)',
          }}
        >
          {m === 'solver' ? 'সমাধানক' : 'অনুসন্ধান'}
        </button>
      ))}
    </div>
  );
}
