'use client';

import { useState, useRef, useEffect } from 'react';
import type { EquationDef } from '../types';

interface Props {
  equation: EquationDef;
  variantIndex: number;
  onChange: (i: number) => void;
}

export default function FormulaDropdown({ equation, variantIndex, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const current = equation.variants[variantIndex] ?? equation.variants[0];

  if (equation.variants.length <= 1) {
    return (
      <div
        className="rounded-xl px-3 py-2.5"
        style={{
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          border: '1.5px solid #F59E0B',
        }}
      >
        <div className="text-[10px] font-semibold mb-0.5" style={{ color: '#92400E' }}>
          সূত্র
        </div>
        <div className="font-mono text-base font-bold" style={{ color: '#78350F' }}>
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
          background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
          border: '1.5px solid #F59E0B',
          boxShadow: '0 2px 6px rgba(245, 158, 11, 0.2)',
        }}
      >
        <div>
          <div className="text-[10px] font-semibold mb-0.5" style={{ color: '#92400E' }}>
            সমাধান চাই: <span className="font-mono" style={{ color: '#78350F' }}>{current.solves}</span>
          </div>
          <div className="font-mono text-base font-bold" style={{ color: '#78350F' }}>
            {current.expression}
          </div>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#92400E"
          strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 mt-1.5 rounded-xl py-1 shadow-xl z-30"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
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
                className="w-full px-3 py-2 text-left flex items-baseline gap-2 transition-colors"
                style={{
                  background: active ? '#FEF3C7' : 'transparent',
                }}
              >
                <span
                  className="text-[10px] w-3 font-bold"
                  style={{ color: active ? '#F59E0B' : 'transparent' }}
                >
                  ✓
                </span>
                <span
                  className="font-mono text-sm flex-1"
                  style={{ color: active ? '#78350F' : '#1E293B', fontWeight: active ? 700 : 500 }}
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
