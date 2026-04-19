'use client';

// ─────────────────────────────────────────────
// Angle Display - Normal line + angle arcs + labels
// Shows θ₁ (incidence), θ₂ (refraction), θc (critical)
// ─────────────────────────────────────────────

interface AngleDisplayProps {
  centerX: number;
  boundaryY: number;
  normalTopY: number;
  normalBottomY: number;
  incidenceAngle: number;
  refractionAngle: number | null;
  criticalAngle: number | null;
  isTIR: boolean;
}

function arc(
  cx: number, cy: number, r: number,
  startDeg: number, endDeg: number
): string {
  const s = (startDeg - 90) * (Math.PI / 180);
  const e = (endDeg - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export default function AngleDisplay({
  centerX,
  boundaryY,
  normalTopY,
  normalBottomY,
  incidenceAngle,
  refractionAngle,
  criticalAngle,
  isTIR,
}: AngleDisplayProps) {
  const arcR = 45;
  const labelR = 60;

  // θ₁ arc (incidence, above boundary, left of normal)
  const inc = incidenceAngle;
  const incMid = (-inc / 2 - 90) * (Math.PI / 180);
  const incLX = centerX + labelR * Math.cos(incMid);
  const incLY = boundaryY + labelR * Math.sin(incMid);

  // θ₂ arc (refraction, below boundary, right of normal)
  const ref = refractionAngle ?? 0;
  const refMid = (ref / 2 + 90) * (Math.PI / 180);
  const refLX = centerX + labelR * Math.cos(refMid);
  const refLY = boundaryY + labelR * Math.sin(refMid);

  // Critical angle arc (dashed, when applicable)
  const crit = criticalAngle;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      {/* Normal line */}
      <line
        x1={centerX} y1={normalTopY}
        x2={centerX} y2={normalBottomY}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.5}
        strokeDasharray="8 5"
      />
      <text x={centerX + 8} y={normalTopY + 14} fill="rgba(255,255,255,0.4)"
        fontSize={12} fontFamily="var(--font-jetbrains)">N</text>
      <text x={centerX + 8} y={normalTopY + 30} fill="rgba(255,255,255,0.25)"
        fontSize={10} fontFamily="var(--font-hind-siliguri)">অভিলম্ব</text>

      {/* Right angle marker */}
      <polyline
        points={`${centerX + 10},${boundaryY} ${centerX + 10},${boundaryY - 10} ${centerX},${boundaryY - 10}`}
        fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={1}
      />

      {/* θ₁ arc (incidence - cyan, above boundary) */}
      <path
        d={arc(centerX, boundaryY, arcR, -inc, 0)}
        fill="none" stroke="#22D3EE" strokeWidth={2} strokeOpacity={0.8}
      />
      <text x={incLX} y={incLY} textAnchor="middle" dominantBaseline="middle"
        fill="#22D3EE" fontSize={12} fontFamily="var(--font-jetbrains)">
        θ₁={inc}°
      </text>

      {/* θ₂ arc (refraction - blue, below boundary) */}
      {refractionAngle !== null && !isTIR && (
        <>
          <path
            d={arc(centerX, boundaryY, arcR, 0, ref)}
            fill="none" stroke="#60A5FA" strokeWidth={2} strokeOpacity={0.8}
            transform={`rotate(180, ${centerX}, ${boundaryY})`}
          />
          <text x={refLX} y={refLY} textAnchor="middle" dominantBaseline="middle"
            fill="#60A5FA" fontSize={12} fontFamily="var(--font-jetbrains)">
            θ₂={Math.round(ref)}°
          </text>
        </>
      )}

      {/* Critical angle indicator (dashed orange arc, above boundary) */}
      {crit !== null && (
        <>
          <path
            d={arc(centerX, boundaryY, arcR + 12, -crit, 0)}
            fill="none" stroke="#FB923C" strokeWidth={1.5}
            strokeDasharray="4 3" strokeOpacity={0.5}
          />
          {/* Critical angle label */}
          {(() => {
            const critMid = (-crit / 2 - 90) * (Math.PI / 180);
            const critLR = arcR + 30;
            const cLX = centerX + critLR * Math.cos(critMid);
            const cLY = boundaryY + critLR * Math.sin(critMid);
            return (
              <text x={cLX} y={cLY - 12} textAnchor="middle"
                fill="rgba(251,146,60,0.6)" fontSize={10}
                fontFamily="var(--font-jetbrains)">
                θc={Math.round(crit)}°
              </text>
            );
          })()}
        </>
      )}

      {/* TIR badge */}
      {isTIR && (
        <g>
          <rect
            x={centerX - 110} y={boundaryY + 50}
            width={220} height={32} rx={8}
            fill="rgba(248,113,113,0.15)"
            stroke="rgba(248,113,113,0.4)"
            strokeWidth={1}
          />
          <text
            x={centerX} y={boundaryY + 71}
            textAnchor="middle" fill="#F87171" fontSize={13}
            fontFamily="var(--font-hind-siliguri)" fontWeight={600}
          >
            পূর্ণ অভ্যন্তরীণ প্রতিফলন (TIR)
          </text>
        </g>
      )}
    </svg>
  );
}
