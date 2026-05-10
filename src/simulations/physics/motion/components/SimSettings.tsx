'use client';

import { useEffect, useRef, useState } from 'react';
import type { DistanceUnit } from '../types';

interface Props {
  textScale: number;
  onTextScaleChange: (scale: number) => void;
  distanceUnit: DistanceUnit;
  onDistanceUnitChange: (u: DistanceUnit) => void;
}

/**
 * Settings popover (⚙️ icon → click to open). Two controls:
 *   1. Text size slider — scales right-panel + embedded sliders for projector use.
 *   2. Distance unit toggle — meters / centimeters (display only).
 *
 * Both persist in localStorage via useMotion.
 */
export default function SimSettings({
  textScale,
  onTextScaleChange,
  distanceUnit,
  onDistanceUnitChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="rounded-full transition-all flex items-center justify-center hover:scale-105"
        style={{
          width: '32px',
          height: '32px',
          background: open ? '#16A34A' : '#F1F5F9',
          color: open ? '#FFFFFF' : '#475569',
          border: `1px solid ${open ? '#16A34A' : '#E2E8F0'}`,
        }}
        title="সেটিংস"
        aria-label="Settings"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-30 rounded-xl shadow-xl"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            width: '260px',
            padding: '12px',
          }}
        >
          {/* ─── Text size slider ─── */}
          <div className="mb-3">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-semibold" style={{ color: '#1E293B' }}>
                ⚖️ লেখার আকার
              </span>
              <span
                className="text-[11px] font-mono font-bold"
                style={{ color: '#16A34A' }}
              >
                {Math.round(textScale * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onTextScaleChange(Math.max(0.7, textScale - 0.1))}
                className="rounded-md flex items-center justify-center font-bold"
                style={{
                  width: '28px',
                  height: '28px',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                }}
                title="ছোট করো"
              >
                A−
              </button>
              <input
                type="range"
                min={0.7}
                max={1.8}
                step={0.05}
                value={textScale}
                onChange={(e) => onTextScaleChange(parseFloat(e.target.value))}
                className="flex-1"
                style={{ accentColor: '#16A34A' }}
              />
              <button
                onClick={() => onTextScaleChange(Math.min(1.8, textScale + 0.1))}
                className="rounded-md flex items-center justify-center font-bold"
                style={{
                  width: '28px',
                  height: '28px',
                  background: '#F1F5F9',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                }}
                title="বড় করো"
              >
                A+
              </button>
            </div>
            <p
              className="text-[10px] mt-1 leading-snug"
              style={{ color: '#94A3B8' }}
            >
              ক্লাসে projector-এ দেখানোর সময় বড় করো। সেটিং localStorage-এ save হবে।
            </p>
            <div className="flex gap-1 mt-1.5">
              {[0.85, 1.0, 1.25, 1.5].map((preset) => {
                const active = Math.abs(textScale - preset) < 0.03;
                return (
                  <button
                    key={preset}
                    onClick={() => onTextScaleChange(preset)}
                    className="flex-1 rounded text-[10px] font-semibold py-1"
                    style={{
                      background: active ? '#16A34A' : '#F8FAFC',
                      color: active ? '#FFFFFF' : '#64748B',
                      border: `1px solid ${active ? '#16A34A' : '#E2E8F0'}`,
                    }}
                  >
                    {Math.round(preset * 100)}%
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px my-2" style={{ background: '#E2E8F0' }} />

          {/* ─── Distance unit toggle ─── */}
          <div>
            <div className="text-xs font-semibold mb-1.5" style={{ color: '#1E293B' }}>
              📏 দূরত্বের একক
            </div>
            <div className="flex gap-1.5">
              {(['m', 'cm'] as DistanceUnit[]).map((u) => {
                const active = u === distanceUnit;
                return (
                  <button
                    key={u}
                    onClick={() => onDistanceUnitChange(u)}
                    className="flex-1 rounded-lg text-sm font-semibold py-1.5 transition-all"
                    style={{
                      background: active ? '#3B82F6' : '#F8FAFC',
                      color: active ? '#FFFFFF' : '#64748B',
                      border: `1px solid ${active ? '#3B82F6' : '#E2E8F0'}`,
                      boxShadow: active ? '0 2px 6px rgba(59, 130, 246, 0.3)' : 'none',
                    }}
                  >
                    {u === 'm' ? 'মিটার (m)' : 'সেন্টিমিটার (cm)'}
                  </button>
                );
              })}
            </div>
            <p
              className="text-[10px] mt-1 leading-snug"
              style={{ color: '#94A3B8' }}
            >
              সব দূরত্ব / সরণ এই unit-এ দেখাবে। গণনা সবসময় meter-এ হয় (display মাত্র)।
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
