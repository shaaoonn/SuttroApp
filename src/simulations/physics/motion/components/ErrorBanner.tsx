'use client';

import type { ValidationError } from '../types';

interface Props {
  error: ValidationError | null;
}

export default function ErrorBanner({ error }: Props) {
  if (!error) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs flex items-start gap-2"
      style={{
        background: '#FEF2F2',
        border: '1.5px solid #FCA5A5',
        color: '#B91C1C',
      }}
    >
      <span style={{ fontSize: '14px', lineHeight: 1 }}>⚠</span>
      <span style={{ lineHeight: 1.4, fontWeight: 500 }}>{error.message}</span>
    </div>
  );
}
