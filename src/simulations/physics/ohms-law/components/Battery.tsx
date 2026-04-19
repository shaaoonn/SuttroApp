'use client';

// ─────────────────────────────────────────────
// Battery - Visual battery component
// Shows voltage value, ± terminals
// ─────────────────────────────────────────────

interface BatteryProps {
  voltage: number;
}

export default function Battery({ voltage }: BatteryProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Battery body */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 80,
          height: 100,
          border: '2px solid var(--canvas-battery)',
          borderRadius: 8,
          background: 'rgba(74, 239, 138, 0.08)',
        }}
      >
        {/* + terminal */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-mono font-bold"
          style={{ color: 'var(--canvas-battery)' }}
        >
          +
        </div>

        {/* Battery cells */}
        <div className="flex flex-col items-center gap-1">
          <div
            className="rounded-sm"
            style={{
              width: 40,
              height: 4,
              background: 'var(--canvas-battery)',
            }}
          />
          <div
            className="rounded-sm"
            style={{
              width: 24,
              height: 4,
              background: 'var(--canvas-battery)',
              opacity: 0.5,
            }}
          />
          <div
            className="rounded-sm"
            style={{
              width: 40,
              height: 4,
              background: 'var(--canvas-battery)',
            }}
          />
          <div
            className="rounded-sm"
            style={{
              width: 24,
              height: 4,
              background: 'var(--canvas-battery)',
              opacity: 0.5,
            }}
          />
        </div>

        {/* Voltage label */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap"
          style={{ color: 'var(--canvas-battery)' }}
        >
          {voltage.toFixed(1)} V
        </div>

        {/* − terminal */}
        <div
          className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs font-mono font-bold"
          style={{ color: 'var(--canvas-battery)', marginBottom: -12 }}
        >
          −
        </div>
      </div>

      {/* Label */}
      <div
        className="mt-8 text-xs text-center"
        style={{ color: 'var(--canvas-label)' }}
      >
        ব্যাটারি
      </div>
    </div>
  );
}
