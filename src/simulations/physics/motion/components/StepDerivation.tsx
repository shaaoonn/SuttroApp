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
        background: 'rgba(11, 29, 58, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setCollapsed((s) => !s)}
      >
        <span
          className="text-xs font-semibold"
          style={{ color: 'rgba(250, 251, 249, 0.85)' }}
        >
          সমাধান
        </span>
        <span
          className="text-[10px] opacity-50"
          style={{ color: '#FAFBF9', transform: collapsed ? 'rotate(-90deg)' : '', transition: 'transform 0.2s' }}
        >
          ▼
        </span>
      </button>
      {!collapsed && (
        <div className="mt-2 space-y-1">
          {variant.steps.map((step, i) => (
            <div
              key={i}
              className="font-mono text-xs leading-relaxed"
              style={{ color: 'rgba(250, 251, 249, 0.85)' }}
            >
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
