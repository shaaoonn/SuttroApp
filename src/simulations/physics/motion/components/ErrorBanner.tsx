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
        background: 'rgba(248, 113, 113, 0.08)',
        border: '1px solid rgba(248, 113, 113, 0.3)',
        color: '#F87171',
      }}
    >
      <span style={{ fontSize: '14px', lineHeight: 1 }}>⚠</span>
      <span style={{ lineHeight: 1.4 }}>{error.message}</span>
    </div>
  );
}
