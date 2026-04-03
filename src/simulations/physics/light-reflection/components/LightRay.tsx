'use client';

// ─────────────────────────────────────────────
// Light Ray — Animated incident & reflected rays
// Yellow beam with arrow heads and glow effect
// ─────────────────────────────────────────────

interface LightRayProps {
  incidentStartX: number;
  incidentStartY: number;
  mirrorCenterX: number;
  mirrorCenterY: number;
  reflectedEndX: number;
  reflectedEndY: number;
}

export default function LightRay({
  incidentStartX,
  incidentStartY,
  mirrorCenterX,
  mirrorCenterY,
  reflectedEndX,
  reflectedEndY,
}: LightRayProps) {
  return (
    <svg
      className="absolute pointer-events-none"
      style={{ left: 0, top: 0, width: '100%', height: '100%' }}
    >
      <defs>
        {/* Glow filter */}
        <filter id="ray-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Arrow marker */}
        <marker
          id="ray-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto-start-reverse"
          fill="#FFD700"
        >
          <path d="M 0 2 L 10 5 L 0 8 Z" />
        </marker>

        {/* Animated dash for ray movement */}
        <style>{`
          @keyframes ray-flow {
            from { stroke-dashoffset: 20; }
            to { stroke-dashoffset: 0; }
          }
          .ray-animated {
            animation: ray-flow 0.5s linear infinite;
          }
        `}</style>
      </defs>

      {/* Incident ray — glow layer */}
      <line
        x1={incidentStartX} y1={incidentStartY}
        x2={mirrorCenterX} y2={mirrorCenterY}
        stroke="#FFD700"
        strokeWidth={4}
        strokeOpacity={0.3}
        filter="url(#ray-glow)"
      />

      {/* Incident ray — solid */}
      <line
        x1={incidentStartX} y1={incidentStartY}
        x2={mirrorCenterX} y2={mirrorCenterY}
        stroke="#FFD700"
        strokeWidth={2.5}
        markerEnd="url(#ray-arrow)"
      />

      {/* Incident ray — animated dashes */}
      <line
        x1={incidentStartX} y1={incidentStartY}
        x2={mirrorCenterX} y2={mirrorCenterY}
        stroke="rgba(255,255,200,0.4)"
        strokeWidth={1}
        strokeDasharray="4 16"
        className="ray-animated"
      />

      {/* Reflected ray — glow layer */}
      <line
        x1={mirrorCenterX} y1={mirrorCenterY}
        x2={reflectedEndX} y2={reflectedEndY}
        stroke="#FFD700"
        strokeWidth={4}
        strokeOpacity={0.3}
        filter="url(#ray-glow)"
      />

      {/* Reflected ray — solid */}
      <line
        x1={mirrorCenterX} y1={mirrorCenterY}
        x2={reflectedEndX} y2={reflectedEndY}
        stroke="#FFD700"
        strokeWidth={2.5}
        markerEnd="url(#ray-arrow)"
      />

      {/* Reflected ray — animated dashes */}
      <line
        x1={mirrorCenterX} y1={mirrorCenterY}
        x2={reflectedEndX} y2={reflectedEndY}
        stroke="rgba(255,255,200,0.4)"
        strokeWidth={1}
        strokeDasharray="4 16"
        className="ray-animated"
      />

      {/* Impact point dot */}
      <circle
        cx={mirrorCenterX} cy={mirrorCenterY}
        r={4}
        fill="#FFD700"
        filter="url(#ray-glow)"
      />

      {/* Light source icon */}
      <circle
        cx={incidentStartX} cy={incidentStartY}
        r={8}
        fill="#FFD700"
        fillOpacity={0.5}
      />
      <circle
        cx={incidentStartX} cy={incidentStartY}
        r={4}
        fill="#FFD700"
      />
    </svg>
  );
}
