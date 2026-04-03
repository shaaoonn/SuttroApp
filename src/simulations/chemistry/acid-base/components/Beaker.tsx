'use client';

// ─────────────────────────────────────────────
// Beaker — SVG lab beaker with animated liquid
// Shows acid + base mixing with color change
// ─────────────────────────────────────────────

interface BeakerProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fillRatio: number;     // 0-1 fill level
  solutionColor: string; // rgb color from pH
  acidVolume: number;
  baseVolume: number;
  totalVolume: number;
  nature: 'acid' | 'base' | 'neutral';
}

export default function Beaker({
  x,
  y,
  width,
  height,
  fillRatio,
  solutionColor,
  acidVolume,
  baseVolume,
  totalVolume,
  nature,
}: BeakerProps) {
  const beakerWall = 4;
  const innerX = x + beakerWall;
  const innerY = y + 10;
  const innerW = width - beakerWall * 2;
  const innerH = height - 20;
  const liquidH = innerH * fillRatio;
  const liquidY = innerY + innerH - liquidH;

  // Acid portion (bottom) and base portion (top) of liquid
  const acidRatio = totalVolume > 0 ? acidVolume / totalVolume : 0;
  const baseRatio = totalVolume > 0 ? baseVolume / totalVolume : 0;

  return (
    <g>
      {/* Beaker glass body */}
      <rect
        x={x}
        y={y + 10}
        width={width}
        height={height - 10}
        rx={6}
        ry={6}
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(200,220,255,0.35)"
        strokeWidth={2.5}
      />

      {/* Beaker rim (wider at top) */}
      <line
        x1={x - 8} y1={y + 10}
        x2={x + 8} y2={y + 10}
        stroke="rgba(200,220,255,0.4)"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={x + width - 8} y1={y + 10}
        x2={x + width + 8} y2={y + 10}
        stroke="rgba(200,220,255,0.4)"
        strokeWidth={3}
        strokeLinecap="round"
      />

      {/* Solution liquid */}
      {fillRatio > 0 && (
        <>
          {/* Main liquid body */}
          <rect
            x={innerX}
            y={liquidY}
            width={innerW}
            height={liquidH}
            rx={4}
            ry={4}
            fill={solutionColor}
            opacity={0.65}
          >
            {/* Gentle wave animation */}
            <animate
              attributeName="y"
              values={`${liquidY};${liquidY - 2};${liquidY}`}
              dur="3s"
              repeatCount="indefinite"
            />
          </rect>

          {/* Surface highlight */}
          <rect
            x={innerX + 4}
            y={liquidY}
            width={innerW - 8}
            height={3}
            rx={1.5}
            fill="rgba(255,255,255,0.2)"
          >
            <animate
              attributeName="y"
              values={`${liquidY};${liquidY - 2};${liquidY}`}
              dur="3s"
              repeatCount="indefinite"
            />
          </rect>

          {/* Bubbles when mixing */}
          {acidVolume > 0 && baseVolume > 0 && (
            <>
              <circle cx={innerX + innerW * 0.3} cy={liquidY + liquidH * 0.4} r={3}
                fill="rgba(255,255,255,0.2)">
                <animate attributeName="cy"
                  values={`${liquidY + liquidH * 0.8};${liquidY + liquidH * 0.1};${liquidY + liquidH * 0.8}`}
                  dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={innerX + innerW * 0.6} cy={liquidY + liquidH * 0.6} r={2}
                fill="rgba(255,255,255,0.15)">
                <animate attributeName="cy"
                  values={`${liquidY + liquidH * 0.9};${liquidY + liquidH * 0.2};${liquidY + liquidH * 0.9}`}
                  dur="3.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.05;0.2" dur="3.2s" repeatCount="indefinite" />
              </circle>
              <circle cx={innerX + innerW * 0.45} cy={liquidY + liquidH * 0.5} r={2.5}
                fill="rgba(255,255,255,0.18)">
                <animate attributeName="cy"
                  values={`${liquidY + liquidH * 0.7};${liquidY + liquidH * 0.15};${liquidY + liquidH * 0.7}`}
                  dur="2.8s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </>
      )}

      {/* Measurement markings */}
      {[0.25, 0.5, 0.75, 1.0].map((mark) => {
        const markY = innerY + innerH * (1 - mark);
        return (
          <g key={mark}>
            <line
              x1={x + width - 2} y1={markY}
              x2={x + width + 10} y2={markY}
              stroke="rgba(200,220,255,0.25)"
              strokeWidth={1}
            />
            <text
              x={x + width + 14}
              y={markY + 4}
              fill="rgba(200,220,255,0.35)"
              fontSize={9}
              fontFamily="monospace"
            >
              {Math.round(mark * 200)}
            </text>
          </g>
        );
      })}

      {/* Volume label */}
      <text
        x={x + width / 2}
        y={y + height + 20}
        fill="rgba(255,255,255,0.5)"
        fontSize={12}
        textAnchor="middle"
        fontFamily="var(--font-hind-siliguri)"
      >
        {totalVolume > 0 ? `${totalVolume} mL` : 'খালি'}
      </text>

      {/* Nature badge */}
      {totalVolume > 0 && (
        <text
          x={x + width / 2}
          y={y + height + 36}
          fill={solutionColor}
          fontSize={11}
          textAnchor="middle"
          fontFamily="var(--font-hind-siliguri)"
          fontWeight="bold"
        >
          {nature === 'acid' ? 'অ্যাসিডিক' : nature === 'base' ? 'ক্ষারীয়' : 'প্রশম'}
        </text>
      )}
    </g>
  );
}
