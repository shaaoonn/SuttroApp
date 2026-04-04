'use client';

import { useRef } from 'react';
import { useTrigonometry } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';

// ─────────────────────────────────────────────
// ত্রিকোণমিতিক অনুপাত (Trigonometric Ratios)
// Unit circle visualization
// ─────────────────────────────────────────────

export default function TrigonometrySim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { variables, state, setVariable, resetAll, config } = useTrigonometry();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();

  const cx = 320;
  const cy = 300;
  const R = 160;

  const readouts = [
    { id: 'sin', label: { bn: 'sin θ', en: 'sin θ' }, value: state.sinValue, unit: '', decimals: 4 },
    { id: 'cos', label: { bn: 'cos θ', en: 'cos θ' }, value: state.cosValue, unit: '', decimals: 4 },
    { id: 'tan', label: { bn: 'tan θ', en: 'tan θ' }, value: isFinite(state.tanValue) ? state.tanValue : 0, unit: isFinite(state.tanValue) ? '' : '∞', decimals: 4 },
  ];

  // Point on circle
  const px = cx + state.px;
  const py = cy + state.py;

  // Arc path for angle
  const arcR = 35;
  const arcEnd = state.angle * Math.PI / 180;
  const arcX = cx + arcR * Math.cos(-arcEnd);
  const arcY = cy + arcR * Math.sin(-arcEnd);
  const largeArc = state.angle > 180 ? 1 : 0;

  return (
    <PlayerShell
      topBar={{ subject: config.subject, chapter: config.nctb.chapter, title: config.title.bn }}
      panZoom={{ zoom: panZoom.zoom, zoomIn: panZoom.zoomIn, zoomOut: panZoom.zoomOut, fitToScreen: panZoom.fitToScreen }}
      interactionMode={{ effectiveMode: interaction.effectiveMode, setMouseMode: interaction.setMouseMode, setHandMode: interaction.setHandMode }}
      cursor={interaction.cursor}
      overlay={
        <>
          <ControlPanel variables={config.variables} values={variables} onChange={setVariable} onReset={resetAll} />
          <ReadoutPanel entries={readouts} />
          <FormulaDisplay formulas={config.formulas} />
        </>
      }
    >
      <PanZoomContainer ref={viewportRef} panZoom={panZoom} mode={interaction.effectiveMode} canvasSize={config.canvasSize}>
        <svg className="absolute" style={{ left: 0, top: 0 }}
          width={config.canvasSize.width} height={config.canvasSize.height}
          viewBox={`0 0 ${config.canvasSize.width} ${config.canvasSize.height}`}>

          <rect width="100%" height="100%" fill="rgba(15,23,42,0.3)" />

          {/* Axes */}
          <line x1={cx - R - 30} y1={cy} x2={cx + R + 30} y2={cy} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <line x1={cx} y1={cy - R - 30} x2={cx} y2={cy + R + 30} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

          {/* Axis labels */}
          <text x={cx + R + 15} y={cy + 18} fill="rgba(255,255,255,0.3)" fontSize={11} fontFamily="monospace">x</text>
          <text x={cx + 8} y={cy - R - 15} fill="rgba(255,255,255,0.3)" fontSize={11} fontFamily="monospace">y</text>

          {/* Quadrant labels */}
          <text x={cx + R / 2} y={cy - R / 2} fill="rgba(255,255,255,0.08)" fontSize={18} textAnchor="middle" fontFamily="monospace">I</text>
          <text x={cx - R / 2} y={cy - R / 2} fill="rgba(255,255,255,0.08)" fontSize={18} textAnchor="middle" fontFamily="monospace">II</text>
          <text x={cx - R / 2} y={cy + R / 2 + 10} fill="rgba(255,255,255,0.08)" fontSize={18} textAnchor="middle" fontFamily="monospace">III</text>
          <text x={cx + R / 2} y={cy + R / 2 + 10} fill="rgba(255,255,255,0.08)" fontSize={18} textAnchor="middle" fontFamily="monospace">IV</text>

          {/* Unit circle */}
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} />

          {/* Angle arc */}
          {state.angle > 0 && state.angle < 360 && (
            <path
              d={`M ${cx + arcR},${cy} A ${arcR},${arcR} 0 ${largeArc},0 ${arcX},${arcY}`}
              fill="none" stroke="rgba(251,191,36,0.6)" strokeWidth={2} />
          )}
          <text x={cx + 45} y={cy - 8} fill="rgba(251,191,36,0.8)" fontSize={13}
            fontFamily="monospace" fontWeight="bold">θ = {state.angle}°</text>

          {/* Radius line (hypotenuse) */}
          <line x1={cx} y1={cy} x2={px} y2={py} stroke="rgba(255,255,255,0.7)" strokeWidth={2} />

          {/* Cosine line (horizontal — base) */}
          <line x1={cx} y1={cy} x2={px} y2={cy} stroke="rgba(34,197,94,0.7)" strokeWidth={2.5} />
          <text x={(cx + px) / 2} y={cy + 20}
            fill="rgba(34,197,94,0.8)" fontSize={11} textAnchor="middle" fontFamily="monospace">
            cos = {state.cosValue.toFixed(3)}
          </text>

          {/* Sine line (vertical — perpendicular) */}
          <line x1={px} y1={cy} x2={px} y2={py} stroke="rgba(239,68,68,0.7)" strokeWidth={2.5} />
          <text x={px + (state.cosValue >= 0 ? 10 : -10)} y={(cy + py) / 2}
            fill="rgba(239,68,68,0.8)" fontSize={11}
            textAnchor={state.cosValue >= 0 ? 'start' : 'end'} fontFamily="monospace">
            sin = {state.sinValue.toFixed(3)}
          </text>

          {/* Point on circle */}
          <circle cx={px} cy={py} r={6} fill="rgba(96,165,250,0.9)" stroke="white" strokeWidth={1.5} />
          <text x={px + (state.cosValue >= 0 ? 12 : -12)} y={py - 10}
            fill="rgba(96,165,250,0.8)" fontSize={10}
            textAnchor={state.cosValue >= 0 ? 'start' : 'end'} fontFamily="monospace">
            ({state.cosValue.toFixed(2)}, {state.sinValue.toFixed(2)})
          </text>

          {/* Right angle marker */}
          {Math.abs(state.sinValue) > 0.05 && Math.abs(state.cosValue) > 0.05 && (
            <rect x={px + (state.cosValue > 0 ? -8 : 0)} y={cy + (state.sinValue > 0 ? -8 : 0)}
              width={8} height={8}
              fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
          )}

          {/* Special angle markers on circle */}
          {[0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330].map(a => {
            const rad = a * Math.PI / 180;
            const mx = cx + R * Math.cos(rad);
            const my = cy - R * Math.sin(rad);
            return (
              <circle key={a} cx={mx} cy={my} r={2}
                fill={a === state.angle ? 'rgba(251,191,36,0.8)' : 'rgba(255,255,255,0.15)'} />
            );
          })}

          {/* Values panel */}
          <g>
            <rect x={560} y={180} width={210} height={200} rx={10}
              fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />

            <text x={665} y={210} fill="rgba(255,255,255,0.6)" fontSize={12}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              ত্রিকোণমিতিক মান
            </text>

            {/* sin */}
            <rect x={575} y={225} width={180} height={28} rx={6}
              fill="rgba(239,68,68,0.08)" />
            <text x={585} y={244} fill="rgba(239,68,68,0.7)" fontSize={13} fontFamily="monospace">
              sin {state.angle}°
            </text>
            <text x={750} y={244} fill="rgba(239,68,68,0.9)" fontSize={13}
              textAnchor="end" fontFamily="monospace" fontWeight="bold">
              {state.sinValue.toFixed(4)}
            </text>

            {/* cos */}
            <rect x={575} y={260} width={180} height={28} rx={6}
              fill="rgba(34,197,94,0.08)" />
            <text x={585} y={279} fill="rgba(34,197,94,0.7)" fontSize={13} fontFamily="monospace">
              cos {state.angle}°
            </text>
            <text x={750} y={279} fill="rgba(34,197,94,0.9)" fontSize={13}
              textAnchor="end" fontFamily="monospace" fontWeight="bold">
              {state.cosValue.toFixed(4)}
            </text>

            {/* tan */}
            <rect x={575} y={295} width={180} height={28} rx={6}
              fill="rgba(251,191,36,0.08)" />
            <text x={585} y={314} fill="rgba(251,191,36,0.7)" fontSize={13} fontFamily="monospace">
              tan {state.angle}°
            </text>
            <text x={750} y={314} fill="rgba(251,191,36,0.9)" fontSize={13}
              textAnchor="end" fontFamily="monospace" fontWeight="bold">
              {isFinite(state.tanValue) ? state.tanValue.toFixed(4) : '∞'}
            </text>

            {/* Quadrant */}
            <text x={665} y={355} fill="rgba(255,255,255,0.4)" fontSize={11}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              চতুর্ভাগ: {['', 'প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ'][state.quadrant]}
            </text>
          </g>

          <text x={400} y={25} fill="rgba(255,255,255,0.06)" fontSize={16}
            textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
            ত্রিকোণমিতিক অনুপাত
          </text>
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
