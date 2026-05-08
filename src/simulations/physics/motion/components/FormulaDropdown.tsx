'use client';

import { useState, useRef, useEffect } from 'react';
import type { EquationDef } from '../types';

interface Props {
  equation: EquationDef;
  variantIndex: number;
  onChange: (i: number) => void;
}

export default function FormulaDropdown({
  equation,
  variantIndex,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const current = equation.variants[variantIndex] ?? equation.variants[0];

  // Free fall has no derivable variants for solving u, a — fewer items
  if (equation.variants.length <= 1) {
    return (
      <div
        className="rounded-xl px-3 py-2.5"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="text-[10px] opacity-50 mb-0.5" style={{ color: '#FAFBF9' }}>
          সূত্র
        </div>
        <div
          className="font-mono text-sm font-semibold"
          style={{ color: '#E8A838' }}
        >
          {current.expression}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full rounded-xl px-3 py-2.5 text-left transition-all flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div>
          <div
            className="text-[10px] opacity-50 mb-0.5"
            style={{ color: '#FAFBF9' }}
          >
            সমাধান চাই: <span style={{ color: '#E8A838' }}>{current.solves}</span>
          </div>
          <div
            className="font-mono text-sm font-semibold"
            style={{ color: '#E8A838' }}
          >
            {current.expression}
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: 'rgba(250, 251, 249, 0.5)', transform: open ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 mt-1.5 rounded-xl py-1 shadow-2xl z-30"
          style={{
            background: '#0B1D3A',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          {equation.variants.map((variant, i) => {
            const active = i === variantIndex;
            return (
              <button
                key={i}
                onClick={() => {
                  onChange(i);
                  setOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-baseline gap-2 transition-colors hover:bg-white/5"
                style={{
                  background: active ? 'rgba(42, 157, 110, 0.15)' : 'transparent',
                }}
              >
                <span
                  className="text-[10px] opacity-60 w-3"
                  style={{ color: '#FAFBF9' }}
                >
                  {active ? '✓' : ''}
                </span>
                <span
                  className="font-mono text-sm flex-1"
                  style={{ color: active ? '#E8A838' : '#FAFBF9' }}
                >
                  {variant.expression}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
