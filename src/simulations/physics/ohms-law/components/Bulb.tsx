'use client';

// ─────────────────────────────────────────────
// Bulb — Light bulb that glows based on power
// Brightness = 0 (off) to 1 (full glow)
// ─────────────────────────────────────────────

interface BulbProps {
  brightness: number; // 0 to 1
}

export default function Bulb({ brightness }: BulbProps) {
  const glowColor = `rgba(255, 224, 102, ${brightness * 0.8})`;
  const glowSize = 10 + brightness * 30;
  const fillOpacity = 0.1 + brightness * 0.6;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 70,
          height: 80,
        }}
      >
        {/* Glow effect */}
        {brightness > 0.05 && (
          <div
            className="absolute rounded-full"
            style={{
              width: glowSize * 2,
              height: glowSize * 2,
              background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Bulb SVG */}
        <svg width="60" height="70" viewBox="0 0 60 70">
          {/* Bulb glass */}
          <ellipse
            cx="30"
            cy="28"
            rx="22"
            ry="24"
            fill={`rgba(255, 224, 102, ${fillOpacity})`}
            stroke="var(--canvas-bulb)"
            strokeWidth="2"
          />
          {/* Filament */}
          <path
            d="M 22,32 L 26,20 L 30,32 L 34,20 L 38,32"
            fill="none"
            stroke={brightness > 0.05 ? 'var(--canvas-bulb)' : 'rgba(255, 224, 102, 0.4)'}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Base */}
          <rect
            x="22"
            y="50"
            width="16"
            height="12"
            rx="2"
            fill="none"
            stroke="var(--canvas-label)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          {/* Base lines */}
          <line x1="22" y1="54" x2="38" y2="54" stroke="var(--canvas-label)" strokeWidth="1" opacity="0.4" />
          <line x1="22" y1="58" x2="38" y2="58" stroke="var(--canvas-label)" strokeWidth="1" opacity="0.4" />
        </svg>
      </div>

      {/* Label */}
      <div
        className="text-xs text-center"
        style={{ color: 'var(--canvas-label)' }}
      >
        বাল্ব {brightness > 0.05 ? '💡' : ''}
      </div>
    </div>
  );
}
