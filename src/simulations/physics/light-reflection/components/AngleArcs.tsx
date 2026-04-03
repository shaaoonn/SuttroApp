'use client';

// ─────────────────────────────────────────────
// Angle Arcs — Shows θᵢ and θᵣ with arcs & labels
// Incident angle (left, cyan), Reflected angle (right, orange)
// ─────────────────────────────────────────────

interface AngleArcsProps {
  centerX: number;
  centerY: number;
  incidenceAngle: number;
  reflectionAngle: number;
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number
): string {
  const startRad = (startAngleDeg - 90) * (Math.PI / 180);
  const endRad = (endAngleDeg - 90) * (Math.PI / 180);

  const x1 = cx + radius * Math.cos(startRad);
  const y1 = cy + radius * Math.sin(startRad);
  const x2 = cx + radius * Math.cos(endRad);
  const y2 = cy + radius * Math.sin(endRad);

  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0;

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export default function AngleArcs({
  centerX,
  centerY,
  incidenceAngle,
  reflectionAngle,
}: AngleArcsProps) {
  const arcRadius = 50;
  const labelRadius = 65;

  // Incident angle arc: from normal (0°/up) to left by incidence angle
  // In SVG coords: normal points up (270°), incident is to the left
  const incStartDeg = -incidenceAngle; // left of normal
  const incEndDeg = 0; // normal (up)

  // Reflected angle arc: from normal (0°/up) to right by reflection angle
  const refStartDeg = 0; // normal (up)
  const refEndDeg = reflectionAngle; // right of normal

  // Label positions
  const incLabelAngleRad = ((incStartDeg / 2 + incEndDeg / 2) - 90) * (Math.PI / 180);
  const refLabelAngleRad = ((refStartDeg / 2 + refEndDeg / 2) - 90) * (Math.PI / 180);

  const incLabelX = centerX + labelRadius * Math.cos(incLabelAngleRad);
  const incLabelY = centerY + labelRadius * Math.sin(incLabelAngleRad);

  const refLabelX = centerX + labelRadius * Math.cos(refLabelAngleRad);
  const refLabelY = centerY + labelRadius * Math.sin(refLabelAngleRad);

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      {/* Incident angle arc — cyan */}
      <path
        d={describeArc(centerX, centerY, arcRadius, incStartDeg, incEndDeg)}
        fill="none"
        stroke="#22D3EE"
        strokeWidth={2}
        strokeOpacity={0.8}
      />

      {/* Incident angle label */}
      <text
        x={incLabelX}
        y={incLabelY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#22D3EE"
        fontSize={13}
        fontFamily="var(--font-jetbrains)"
      >
        θᵢ={incidenceAngle}°
      </text>

      {/* Reflected angle arc — orange */}
      <path
        d={describeArc(centerX, centerY, arcRadius, refStartDeg, refEndDeg)}
        fill="none"
        stroke="#FB923C"
        strokeWidth={2}
        strokeOpacity={0.8}
      />

      {/* Reflected angle label */}
      <text
        x={refLabelX}
        y={refLabelY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#FB923C"
        fontSize={13}
        fontFamily="var(--font-jetbrains)"
      >
        θᵣ={reflectionAngle}°
      </text>
    </svg>
  );
}
