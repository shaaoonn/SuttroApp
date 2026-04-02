'use client';

// ─────────────────────────────────────────────
// Resistor — Zigzag resistor symbol
// Shows resistance value in Ω
// ─────────────────────────────────────────────

interface ResistorProps {
  resistance: number;
}

export default function Resistor({ resistance }: ResistorProps) {
  // Zigzag pattern for resistor symbol
  const zigzagPath = 'M 0,20 L 10,0 L 20,40 L 30,0 L 40,40 L 50,0 L 60,40 L 70,0 L 80,20';

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 120,
          height: 60,
          border: '2px solid var(--canvas-resistor)',
          borderRadius: 8,
          background: 'rgba(232, 168, 56, 0.08)',
        }}
      >
        {/* Zigzag SVG */}
        <svg width="80" height="40" viewBox="0 0 80 40">
          <path
            d={zigzagPath}
            fill="none"
            stroke="var(--canvas-resistor)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Resistance value */}
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-mono whitespace-nowrap"
          style={{ color: 'var(--canvas-resistor)' }}
        >
          {resistance} Ω
        </div>
      </div>

      {/* Label */}
      <div
        className="mt-8 text-xs text-center"
        style={{ color: 'var(--canvas-label)' }}
      >
        রোধ
      </div>
    </div>
  );
}
