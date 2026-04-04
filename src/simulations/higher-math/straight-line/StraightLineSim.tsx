'use client';

import { useRef } from 'react';
import { useStraightLine } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';

// ─────────────────────────────────────────────
// সরলরেখার সমীকরণ (Equation of Straight Line)
// y = mx + c on coordinate plane
// ─────────────────────────────────────────────

export default function StraightLineSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { variables, state, setVariable, resetAll, config } = useStraightLine();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();

  const originX = 400;
  const originY = 300;
  const scale = 30;

  const readouts = [
    { id: 'slope', label: { bn: 'ঢাল (m)', en: 'Slope' }, value: state.slope, unit: '', decimals: 1 },
    { id: 'yInt', label: { bn: 'y-ছেদাংশ', en: 'y-intercept' }, value: state.intercept, unit: '', decimals: 1 },
    { id: 'angle', label: { bn: 'কোণ', en: 'Angle' }, value: state.angleDeg, unit: '°', decimals: 1 },
  ];

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

          {/* Grid */}
          <g opacity={0.06}>
            {Array.from({ length: 27 }, (_, i) => {
              const x = originX + (i - 13) * scale;
              return <line key={`v${i}`} x1={x} y1={0} x2={x} y2={600} stroke="white" strokeWidth={0.5} />;
            })}
            {Array.from({ length: 21 }, (_, i) => {
              const y = originY + (i - 10) * scale;
              return <line key={`h${i}`} x1={0} y1={y} x2={800} y2={y} stroke="white" strokeWidth={0.5} />;
            })}
          </g>

          {/* Axes */}
          <line x1={10} y1={originY} x2={790} y2={originY} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />
          <line x1={originX} y1={10} x2={originX} y2={590} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} />

          {/* Axis tick marks & numbers */}
          {Array.from({ length: 21 }, (_, i) => {
            const n = i - 10;
            if (n === 0) return null;
            return (
              <g key={`tx${i}`}>
                <line x1={originX + n * scale} y1={originY - 4} x2={originX + n * scale} y2={originY + 4}
                  stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                {n % 2 === 0 && (
                  <text x={originX + n * scale} y={originY + 18} fill="rgba(255,255,255,0.25)"
                    fontSize={9} textAnchor="middle" fontFamily="monospace">{n}</text>
                )}
              </g>
            );
          })}
          {Array.from({ length: 15 }, (_, i) => {
            const n = i - 7;
            if (n === 0) return null;
            return (
              <g key={`ty${i}`}>
                <line x1={originX - 4} y1={originY - n * scale} x2={originX + 4} y2={originY - n * scale}
                  stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
                {n % 2 === 0 && (
                  <text x={originX - 12} y={originY - n * scale + 4} fill="rgba(255,255,255,0.25)"
                    fontSize={9} textAnchor="end" fontFamily="monospace">{n}</text>
                )}
              </g>
            );
          })}

          <text x={785} y={originY - 8} fill="rgba(255,255,255,0.3)" fontSize={12} fontFamily="monospace">x</text>
          <text x={originX + 8} y={18} fill="rgba(255,255,255,0.3)" fontSize={12} fontFamily="monospace">y</text>
          <text x={originX - 12} y={originY + 18} fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="monospace">O</text>

          {/* The line y = mx + c */}
          <line x1={state.p1.x} y1={state.p1.y} x2={state.p2.x} y2={state.p2.y}
            stroke="rgba(59,130,246,0.8)" strokeWidth={2.5} />

          {/* y-intercept point */}
          <circle cx={originX} cy={originY - state.intercept * scale} r={6}
            fill="rgba(239,68,68,0.9)" stroke="white" strokeWidth={1.5} />
          <text x={originX + 12} y={originY - state.intercept * scale + 5}
            fill="rgba(239,68,68,0.8)" fontSize={11} fontFamily="monospace">
            (0, {state.intercept})
          </text>

          {/* x-intercept point */}
          {state.xIntercept !== null && Math.abs(state.xIntercept) < 15 && (
            <>
              <circle cx={originX + state.xIntercept * scale} cy={originY} r={5}
                fill="rgba(34,197,94,0.8)" stroke="white" strokeWidth={1.5} />
              <text x={originX + state.xIntercept * scale} y={originY + 22}
                fill="rgba(34,197,94,0.7)" fontSize={10} textAnchor="middle" fontFamily="monospace">
                ({state.xIntercept.toFixed(1)}, 0)
              </text>
            </>
          )}

          {/* Slope triangle */}
          {state.slope !== 0 && (
            <g opacity={0.5}>
              <line x1={originX + scale} y1={originY - state.intercept * scale}
                x2={originX + 2 * scale} y2={originY - state.intercept * scale}
                stroke="rgba(251,191,36,0.6)" strokeWidth={1.5} />
              <line x1={originX + 2 * scale} y1={originY - state.intercept * scale}
                x2={originX + 2 * scale} y2={originY - (state.intercept + state.slope) * scale}
                stroke="rgba(251,191,36,0.6)" strokeWidth={1.5} />
              <text x={originX + 1.5 * scale} y={originY - state.intercept * scale + 15}
                fill="rgba(251,191,36,0.6)" fontSize={9} textAnchor="middle" fontFamily="monospace">1</text>
              <text x={originX + 2 * scale + 12} y={originY - (state.intercept + state.slope / 2) * scale + 4}
                fill="rgba(251,191,36,0.6)" fontSize={9} fontFamily="monospace">m={state.slope}</text>
            </g>
          )}

          {/* Equation display */}
          <g>
            <rect x={550} y={440} width={220} height={70} rx={10}
              fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <text x={660} y={468} fill="rgba(59,130,246,0.9)" fontSize={18}
              textAnchor="middle" fontFamily="monospace" fontWeight="bold">
              y = {state.slope === 1 ? '' : state.slope === -1 ? '-' : state.slope}x{state.intercept >= 0 ? ` + ${state.intercept}` : ` - ${Math.abs(state.intercept)}`}
            </text>
            <text x={660} y={495} fill="rgba(255,255,255,0.4)" fontSize={11}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              ঢাল-ছেদাংশ আকার
            </text>
          </g>

          <text x={400} y={25} fill="rgba(255,255,255,0.06)" fontSize={16}
            textAnchor="middle" fontFamily="var(--font-hind-siliguri)">সরলরেখার সমীকরণ</text>
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
