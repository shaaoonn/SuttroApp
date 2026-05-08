'use client';

import { useState } from 'react';
import type { FormulaVariant } from '../types';

interface Props {
  variant: FormulaVariant;
}

export default function StepDerivation({ variant }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  if (!variant.steps || variant.steps.length === 0) return null;

  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{
        background: '#F0F9FF',
        border: '1px solid #BAE6FD',
      }}
    >
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setCollapsed((s) => !s)}
      >
        <span className="text-xs font-semibold" style={{ color: '#0369A1' }}>
          সমাধান
        </span>
        <span
          className="text-xs"
          style={{
            color: '#0369A1',
            transform: collapsed ? 'rotate(-90deg)' : '',
            transition: 'transform 0.2s',
          }}
        >
          ▼
        </span>
      </button>
      {!collapsed && (
        <div className="mt-1.5 space-y-0.5">
          {variant.steps.map((step, i) => (
            <div
              key={i}
              className="font-mono text-xs leading-relaxed"
              style={{ color: '#075985' }}
            >
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
