'use client';

// ─────────────────────────────────────────────
// Refraction Rays — Incident, Refracted, Reflected
// Shows all three rays with proper intensity
// During TIR: reflected ray at full, no refracted ray
// ─────────────────────────────────────────────

interface RefractionRaysProps {
  centerX: number;
  boundaryY: number;
  incidentStartX: number;
  incidentStartY: number;
  refractedEndX: number | null;
  refractedEndY: number | null;
  reflectedEndX: number;
  reflectedEndY: number;
  isTIR: boolean;
  reflectionIntensity: number;
}

export default function RefractionRays({
  centerX,
  boundaryY,
  incidentStartX,
  incidentStartY,
  refractedEndX,
  refractedEndY,
  reflectedEndX,
  reflectedEndY,
  isTIR,
  reflectionIntensity,
}: RefractionRaysProps) {
  const refractionIntensity = 1 - reflectionIntensity;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <filter id="refr-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="refr-arrow" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse" fill="#FFD700">
          <path d="M 0 2 L 10 5 L 0 8 Z" />
        </marker>
        <marker id="refr-arrow-blue" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse" fill="#60A5FA">
          <path d="M 0 2 L 10 5 L 0 8 Z" />
        </marker>
        <marker id="refr-arrow-red" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="7" markerHeight="7" orient="auto-start-reverse" fill="#F87171">
          <path d="M 0 2 L 10 5 L 0 8 Z" />
        </marker>
        <style>{`
          @keyframes refr-flow { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }
          .refr-anim { animation: refr-flow 0.5s linear infinite; }
        `}</style>
      </defs>

      {/* ── Incident ray (yellow) ── */}
      <line
        x1={incidentStartX} y1={incidentStartY}
        x2={centerX} y2={boundaryY}
        stroke="#FFD700" strokeWidth={4} strokeOpacity={0.3}
        filter="url(#refr-glow)"
      />
      <line
        x1={incidentStartX} y1={incidentStartY}
        x2={centerX} y2={boundaryY}
        stroke="#FFD700" strokeWidth={2.5}
        markerEnd="url(#refr-arrow)"
      />
      <line
        x1={incidentStartX} y1={incidentStartY}
        x2={centerX} y2={boundaryY}
        stroke="rgba(255,255,200,0.3)" strokeWidth={1}
        strokeDasharray="4 16" className="refr-anim"
      />

      {/* ── Refracted ray (blue, in medium 2) ── */}
      {refractedEndX !== null && refractedEndY !== null && refractionIntensity > 0.01 && (
        <>
          <line
            x1={centerX} y1={boundaryY}
            x2={refractedEndX} y2={refractedEndY}
            stroke="#60A5FA" strokeWidth={4}
            strokeOpacity={refractionIntensity * 0.3}
            filter="url(#refr-glow)"
          />
          <line
            x1={centerX} y1={boundaryY}
            x2={refractedEndX} y2={refractedEndY}
            stroke="#60A5FA"
            strokeWidth={Math.max(1, 2.5 * refractionIntensity)}
            strokeOpacity={refractionIntensity}
            markerEnd="url(#refr-arrow-blue)"
          />
          <line
            x1={centerX} y1={boundaryY}
            x2={refractedEndX} y2={refractedEndY}
            stroke="rgba(150,200,255,0.3)" strokeWidth={1}
            strokeDasharray="4 16" className="refr-anim"
            strokeOpacity={refractionIntensity}
          />

          {/* Label */}
          <text
            x={refractedEndX + 10} y={refractedEndY - 5}
            fill="rgba(96,165,250,0.7)" fontSize={11}
            fontFamily="var(--font-hind-siliguri)"
          >
            প্রতিসরিত রশ্মি
          </text>
        </>
      )}

      {/* ── Reflected ray (red/orange) ── */}
      <line
        x1={centerX} y1={boundaryY}
        x2={reflectedEndX} y2={reflectedEndY}
        stroke={isTIR ? '#F87171' : '#FB923C'}
        strokeWidth={4}
        strokeOpacity={reflectionIntensity * 0.3}
        filter="url(#refr-glow)"
      />
      <line
        x1={centerX} y1={boundaryY}
        x2={reflectedEndX} y2={reflectedEndY}
        stroke={isTIR ? '#F87171' : '#FB923C'}
        strokeWidth={Math.max(1, 2.5 * reflectionIntensity)}
        strokeOpacity={Math.max(0.25, reflectionIntensity)}
        markerEnd={isTIR ? 'url(#refr-arrow-red)' : undefined}
      />

      {/* Reflected label (only when significant) */}
      {reflectionIntensity > 0.3 && (
        <text
          x={reflectedEndX + 10} y={reflectedEndY - 5}
          fill={isTIR ? 'rgba(248,113,113,0.8)' : 'rgba(251,146,60,0.6)'}
          fontSize={11}
          fontFamily="var(--font-hind-siliguri)"
        >
          {isTIR ? 'পূর্ণ অভ্যন্তরীণ প্রতিফলন!' : 'প্রতিফলিত রশ্মি'}
        </text>
      )}

      {/* Impact point */}
      <circle cx={centerX} cy={boundaryY} r={4} fill="#FFD700"
        filter="url(#refr-glow)" />

      {/* Light source */}
      <circle cx={incidentStartX} cy={incidentStartY} r={8}
        fill="#FFD700" fillOpacity={0.4} />
      <circle cx={incidentStartX} cy={incidentStartY} r={4}
        fill="#FFD700" />
      <text
        x={incidentStartX - 30} y={incidentStartY - 15}
        fill="rgba(255,215,0,0.6)" fontSize={11}
        fontFamily="var(--font-hind-siliguri)"
      >
        আপতিত রশ্মি
      </text>
    </svg>
  );
}
