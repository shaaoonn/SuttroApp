'use client';

import { useRef } from 'react';
import { usePhotosynthesis } from './useSimulation';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import { useSimNarration, useSoundToggle } from '@/hooks/useSimNarration';
import { SIM_NARRATIONS } from '@/data/simNarrations';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import ReadoutPanel from '@/components/player/ReadoutPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';

// ─────────────────────────────────────────────
// সালোকসংশ্লেষণ (Photosynthesis)
// NCTB Class 9, Chapter 3
// 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
// ─────────────────────────────────────────────

export default function PhotosynthesisSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { variables, state, setVariable, resetAll, config } = usePhotosynthesis();
  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();
  const { soundEnabled, toggleSound } = useSoundToggle();
  useSimNarration({ template: SIM_NARRATIONS['photosynthesis'], values: variables, soundEnabled });

  const readouts = [
    {
      id: 'rate',
      label: { bn: 'সংশ্লেষণ হার', en: 'Photosynthesis Rate' },
      value: state.rate,
      unit: '%',
      decimals: 0,
    },
    {
      id: 'o2',
      label: { bn: 'O₂ উৎপাদন', en: 'O₂ Production' },
      value: state.oxygenRate,
      unit: '',
      decimals: 1,
    },
    {
      id: 'glucose',
      label: { bn: 'গ্লুকোজ উৎপাদন', en: 'Glucose Production' },
      value: state.glucoseRate,
      unit: '',
      decimals: 1,
    },
  ];

  // Leaf center position
  const leafCX = 400;
  const leafCY = 280;

  return (
    <PlayerShell
      topBar={{
        subject: config.subject,
        chapter: config.nctb.chapter,
        title: config.title.bn,
      }}
      panZoom={{
        zoom: panZoom.zoom,
        zoomIn: panZoom.zoomIn,
        zoomOut: panZoom.zoomOut,
        fitToScreen: panZoom.fitToScreen,
      }}
      interactionMode={{
        effectiveMode: interaction.effectiveMode,
        setMouseMode: interaction.setMouseMode,
        setHandMode: interaction.setHandMode,
      }}
      sound={{ enabled: soundEnabled, toggle: toggleSound }}
      cursor={interaction.cursor}
      overlay={
        <>
          <ControlPanel
            variables={config.variables}
            values={variables}
            onChange={setVariable}
            onReset={resetAll}
          />
          <ReadoutPanel entries={readouts} />
          <FormulaDisplay formulas={config.formulas} />
        </>
      }
    >
      <PanZoomContainer
        ref={viewportRef}
        panZoom={panZoom}
        mode={interaction.effectiveMode}
        canvasSize={config.canvasSize}
      >
        <svg
          className="absolute"
          style={{ left: 0, top: 0 }}
          width={config.canvasSize.width}
          height={config.canvasSize.height}
          viewBox={`0 0 ${config.canvasSize.width} ${config.canvasSize.height}`}
        >
          <defs>
            <radialGradient id="sunGradient">
              <stop offset="0%" stopColor={`rgba(251,191,36,${0.3 * state.sunGlow})`} />
              <stop offset="50%" stopColor={`rgba(251,191,36,${0.1 * state.sunGlow})`} />
              <stop offset="100%" stopColor="rgba(251,191,36,0)" />
            </radialGradient>
            <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`rgba(34,197,94,${state.leafGreen})`} />
              <stop offset="100%" stopColor={`rgba(22,163,74,${state.leafGreen})`} />
            </linearGradient>
          </defs>

          {/* Background */}
          <rect width="100%" height="100%" fill="rgba(15,23,42,0.3)" />

          {/* Sun */}
          <g>
            <circle cx={130} cy={80} r={100} fill="url(#sunGradient)">
              <animate attributeName="r" values="95;105;95"
                dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx={130} cy={80} r={35}
              fill={`rgba(251,191,36,${0.2 + state.sunGlow * 0.6})`}
              stroke={`rgba(251,191,36,${0.3 + state.sunGlow * 0.4})`}
              strokeWidth={2} />

            {/* Sun rays */}
            {state.light > 0 && Array.from({ length: 8 }, (_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              const r1 = 42;
              const r2 = 55 + state.sunGlow * 15;
              return (
                <line key={i}
                  x1={130 + Math.cos(angle) * r1} y1={80 + Math.sin(angle) * r1}
                  x2={130 + Math.cos(angle) * r2} y2={80 + Math.sin(angle) * r2}
                  stroke={`rgba(251,191,36,${0.2 + state.sunGlow * 0.4})`}
                  strokeWidth={2} strokeLinecap="round" />
              );
            })}

            <text x={130} y={85} fill="rgba(251,191,36,0.8)" fontSize={14}
              textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              ☀
            </text>

            {/* Light label */}
            <text x={130} y={140} fill="rgba(251,191,36,0.5)" fontSize={11}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              সূর্যালোক ({state.light}%)
            </text>
          </g>

          {/* Light rays to leaf */}
          {state.light > 0 && (
            <g opacity={state.sunGlow * 0.4}>
              {[0, 1, 2].map(i => (
                <line key={i}
                  x1={170 + i * 10} y1={100 + i * 5}
                  x2={leafCX - 80 + i * 30} y2={leafCY - 60}
                  stroke="rgba(251,191,36,0.3)"
                  strokeWidth={1.5}
                  strokeDasharray="8,6">
                  <animate attributeName="stroke-dashoffset"
                    values="0;-14" dur={`${1.5 / state.flowSpeed}s`}
                    repeatCount="indefinite" />
                </line>
              ))}
            </g>
          )}

          {/* Leaf */}
          <g>
            {/* Leaf shape */}
            <ellipse cx={leafCX} cy={leafCY} rx={120} ry={60}
              fill="url(#leafGrad)"
              stroke={`rgba(22,163,74,${0.3 + state.leafGreen * 0.4})`}
              strokeWidth={2}
              transform={`rotate(-10, ${leafCX}, ${leafCY})`} />

            {/* Leaf midrib */}
            <line x1={leafCX - 100} y1={leafCY + 5}
              x2={leafCX + 100} y2={leafCY - 5}
              stroke={`rgba(22,100,50,${0.3 + state.leafGreen * 0.3})`}
              strokeWidth={2}
              transform={`rotate(-10, ${leafCX}, ${leafCY})`} />

            {/* Leaf veins */}
            {[-50, -20, 20, 50].map((offset, i) => (
              <line key={i}
                x1={leafCX + offset} y1={leafCY}
                x2={leafCX + offset + (i < 2 ? -15 : 15)} y2={leafCY + (i < 2 ? -25 : -25)}
                stroke={`rgba(22,100,50,${0.2 + state.leafGreen * 0.2})`}
                strokeWidth={1}
                transform={`rotate(-10, ${leafCX}, ${leafCY})`} />
            ))}

            {/* Chloroplast dots */}
            {state.rate > 0 && [
              { x: -40, y: -10 }, { x: 0, y: -15 }, { x: 40, y: -10 },
              { x: -20, y: 10 }, { x: 20, y: 10 },
            ].map((pos, i) => (
              <circle key={i}
                cx={leafCX + pos.x} cy={leafCY + pos.y} r={4}
                fill={`rgba(34,197,94,${0.3 + state.rate / 200})`}>
                <animate attributeName="opacity"
                  values={`${0.3 + state.rate / 200};${0.6 + state.rate / 200};${0.3 + state.rate / 200}`}
                  dur="2s" repeatCount="indefinite" />
              </circle>
            ))}

            {/* Label */}
            <text x={leafCX} y={leafCY + 80}
              fill="rgba(34,197,94,0.6)" fontSize={12}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              পাতা (ক্লোরোফিল)
            </text>
          </g>

          {/* CO₂ input (left) */}
          <g>
            <rect x={40} y={240} width={90} height={40} rx={8}
              fill="rgba(156,163,175,0.1)" stroke="rgba(156,163,175,0.3)" strokeWidth={1} />
            <text x={85} y={258} fill="rgba(156,163,175,0.7)" fontSize={13}
              textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              CO₂
            </text>
            <text x={85} y={275} fill="rgba(156,163,175,0.4)" fontSize={9}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              {state.co2}%
            </text>

            {/* CO₂ flow arrow */}
            {state.co2 > 0 && (
              <line x1={135} y1={260} x2={leafCX - 125} y2={leafCY}
                stroke="rgba(156,163,175,0.3)"
                strokeWidth={2} strokeDasharray="6,4">
                <animate attributeName="stroke-dashoffset"
                  values="0;-10" dur={`${1.5 / state.flowSpeed}s`}
                  repeatCount="indefinite" />
              </line>
            )}
          </g>

          {/* H₂O input (bottom) */}
          <g>
            <rect x={leafCX - 45} y={430} width={90} height={40} rx={8}
              fill="rgba(59,130,246,0.1)" stroke="rgba(59,130,246,0.3)" strokeWidth={1} />
            <text x={leafCX} y={448} fill="rgba(59,130,246,0.7)" fontSize={13}
              textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              H₂O
            </text>
            <text x={leafCX} y={465} fill="rgba(59,130,246,0.4)" fontSize={9}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              পানি ({state.water}%)
            </text>

            {/* Water flow arrow */}
            {state.water > 0 && (
              <line x1={leafCX} y1={425} x2={leafCX} y2={leafCY + 60}
                stroke="rgba(59,130,246,0.3)"
                strokeWidth={2} strokeDasharray="6,4">
                <animate attributeName="stroke-dashoffset"
                  values="0;-10" dur={`${1.5 / state.flowSpeed}s`}
                  repeatCount="indefinite" />
              </line>
            )}
          </g>

          {/* O₂ output (right) */}
          <g>
            <rect x={650} y={200} width={90} height={40} rx={8}
              fill="rgba(96,165,250,0.1)" stroke="rgba(96,165,250,0.3)" strokeWidth={1} />
            <text x={695} y={218} fill="rgba(96,165,250,0.7)" fontSize={13}
              textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              O₂
            </text>
            <text x={695} y={235} fill="rgba(96,165,250,0.4)" fontSize={9}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              অক্সিজেন
            </text>

            {/* O₂ flow arrow */}
            {state.rate > 0 && (
              <line x1={leafCX + 125} y1={leafCY - 20} x2={645} y2={220}
                stroke="rgba(96,165,250,0.3)"
                strokeWidth={2} strokeDasharray="6,4">
                <animate attributeName="stroke-dashoffset"
                  values="0;10" dur={`${1.5 / state.flowSpeed}s`}
                  repeatCount="indefinite" />
              </line>
            )}

            {/* O₂ bubbles */}
            {Array.from({ length: state.bubbleCount }, (_, i) => (
              <circle key={i}
                cx={660 + (i % 3) * 15} cy={180}
                r={4 + (i % 2) * 2}
                fill="rgba(96,165,250,0.15)"
                stroke="rgba(96,165,250,0.3)"
                strokeWidth={0.5}>
                <animate attributeName="cy"
                  values={`${190 - i * 8};${140 - i * 8};${190 - i * 8}`}
                  dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity"
                  values="0.4;0.1;0.4"
                  dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          {/* Glucose output (bottom-right) */}
          <g>
            <rect x={620} y={350} width={120} height={40} rx={8}
              fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" strokeWidth={1} />
            <text x={680} y={368} fill="rgba(251,191,36,0.7)" fontSize={12}
              textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              C₆H₁₂O₆
            </text>
            <text x={680} y={385} fill="rgba(251,191,36,0.4)" fontSize={9}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              গ্লুকোজ
            </text>

            {/* Glucose flow */}
            {state.rate > 0 && (
              <line x1={leafCX + 100} y1={leafCY + 20} x2={615} y2={370}
                stroke="rgba(251,191,36,0.25)"
                strokeWidth={2} strokeDasharray="6,4">
                <animate attributeName="stroke-dashoffset"
                  values="0;10" dur={`${1.5 / state.flowSpeed}s`}
                  repeatCount="indefinite" />
              </line>
            )}
          </g>

          {/* Rate meter */}
          <g>
            <rect x={30} y={400} width={200} height={70} rx={8}
              fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

            <text x={45} y={420} fill="rgba(255,255,255,0.5)" fontSize={10}
              fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              সংশ্লেষণ হার
            </text>

            {/* Rate bar background */}
            <rect x={45} y={430} width={170} height={12} rx={6}
              fill="rgba(255,255,255,0.05)" />

            {/* Rate bar fill */}
            <rect x={45} y={430}
              width={170 * state.rate / 100} height={12} rx={6}
              fill={`rgba(34,197,94,${0.4 + state.rate / 200})`} />

            <text x={45} y={458} fill="rgba(255,255,255,0.4)" fontSize={10}
              fontFamily="var(--font-hind-siliguri)">
              সীমাবদ্ধ উপাদান: <tspan fill="rgba(251,191,36,0.7)">{state.limitingFactor}</tspan>
            </text>
          </g>

          {/* Title watermark */}
          <text x={400} y={25}
            fill="rgba(255,255,255,0.06)" fontSize={16}
            textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
            সালোকসংশ্লেষণ
          </text>

          {/* No light warning */}
          {state.light === 0 && (
            <g>
              <rect x={leafCX - 80} y={leafCY - 15} width={160} height={30} rx={8}
                fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.3)" strokeWidth={1} />
              <text x={leafCX} y={leafCY + 5}
                fill="rgba(239,68,68,0.7)" fontSize={11}
                textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
                আলো নেই - সংশ্লেষণ বন্ধ
              </text>
            </g>
          )}
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
