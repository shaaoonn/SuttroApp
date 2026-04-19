'use client';

// ─────────────────────────────────────────────
// Ammeter - Current measurement display
// Shows current value with needle indicator
// ─────────────────────────────────────────────

interface AmmeterProps {
  current: number;
  maxCurrent?: number;
}

export default function Ammeter({ current, maxCurrent = 24 }: AmmeterProps) {
  // Needle angle: -90° (0A) to +90° (maxA)
  const normalizedCurrent = Math.min(1, current / maxCurrent);
  const needleAngle = -90 + normalizedCurrent * 180;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 80,
          height: 80,
          border: '2px solid var(--canvas-ammeter)',
          borderRadius: '50%',
          background: 'rgba(255, 107, 107, 0.08)',
        }}
      >
        {/* A label */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-mono font-bold"
          style={{ color: 'var(--canvas-ammeter)' }}
        >
          A
        </div>

        {/* Needle */}
        <svg
          width="60"
          height="40"
          viewBox="0 0 60 40"
          className="absolute"
          style={{ top: 20, left: 10 }}
        >
          {/* Scale arc */}
          <path
            d="M 5,35 A 28 28 0 0 1 55,35"
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
          />
          {/* Scale ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const angle = (-90 + tick * 180) * (Math.PI / 180);
            const x1 = 30 + Math.cos(angle) * 24;
            const y1 = 35 + Math.sin(angle) * 24;
            const x2 = 30 + Math.cos(angle) * 28;
            const y2 = 35 + Math.sin(angle) * 28;
            return (
              <line
                key={tick}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="1"
              />
            );
          })}
          {/* Needle */}
          <line
            x1="30"
            y1="35"
            x2={30 + Math.cos(needleAngle * (Math.PI / 180)) * 22}
            y2={35 + Math.sin(needleAngle * (Math.PI / 180)) * 22}
            stroke="var(--canvas-ammeter)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Pivot */}
          <circle cx="30" cy="35" r="3" fill="var(--canvas-ammeter)" />
        </svg>

        {/* Current value */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap"
          style={{ color: 'var(--canvas-ammeter)' }}
        >
          {current.toFixed(2)} A
        </div>
      </div>

      {/* Label */}
      <div
        className="mt-8 text-xs text-center"
        style={{ color: 'var(--canvas-label)' }}
      >
        অ্যামিটার
      </div>
    </div>
  );
}
