'use client';

import { useRef, useState, useCallback } from 'react';
import { tenseTimelineConfig, TENSES, TENSE_GROUPS, TENSE_GROUPS_BN, SUB_TYPES_BN } from './config';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';
import type { VariableConfig } from '@/simulations/_template/config';

// ─────────────────────────────────────────────
// কাল — টেন্স টাইমলাইন (Tense Timeline)
// Visual timeline of 12 English tenses
// ─────────────────────────────────────────────

export default function TenseTimelineSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const config = tenseTimelineConfig;

  const initialVars: Record<string, number> = {};
  config.variables.forEach((v: VariableConfig) => { initialVars[v.id] = v.default; });
  const [variables, setVariables] = useState<Record<string, number>>(initialVars);
  const setVariable = useCallback((id: string, value: number) => {
    setVariables((prev) => ({ ...prev, [id]: value }));
  }, []);
  const resetAll = useCallback(() => { setVariables(initialVars); }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const interaction = useInteractionMode();

  const group = Math.round(variables.tenseGroup ?? 0);
  const subType = Math.round(variables.subType ?? 0);
  const tense = TENSES[group]?.[subType] || TENSES[0][0];

  const timelineY = 120;
  const groupColors = ['#F87171', '#34D399', '#818CF8'];

  return (
    <PlayerShell
      topBar={{ subject: config.subject, chapter: config.nctb.chapter, title: config.title.bn }}
      panZoom={{ zoom: panZoom.zoom, zoomIn: panZoom.zoomIn, zoomOut: panZoom.zoomOut, fitToScreen: panZoom.fitToScreen }}
      interactionMode={{ effectiveMode: interaction.effectiveMode, setMouseMode: interaction.setMouseMode, setHandMode: interaction.setHandMode }}
      cursor={interaction.cursor}
      overlay={
        <>
          <ControlPanel variables={config.variables} values={variables} onChange={setVariable} onReset={resetAll} />
          <FormulaDisplay formulas={config.formulas} />
        </>
      }
    >
      <PanZoomContainer ref={viewportRef} panZoom={panZoom} mode={interaction.effectiveMode} canvasSize={config.canvasSize}>
        <svg className="absolute" style={{ left: 0, top: 0 }}
          width={config.canvasSize.width} height={config.canvasSize.height}
          viewBox={`0 0 ${config.canvasSize.width} ${config.canvasSize.height}`}>

          <rect width="100%" height="100%" fill="rgba(15,23,42,0.3)" />

          {/* Timeline */}
          <line x1={50} y1={timelineY} x2={750} y2={timelineY}
            stroke="rgba(255,255,255,0.2)" strokeWidth={2} />

          {/* Timeline sections */}
          {TENSE_GROUPS.map((g, i) => {
            const x = 50 + (i / 3) * 700;
            const w = 700 / 3;
            const isActive = i === group;
            return (
              <g key={i}>
                <rect x={x} y={timelineY - 25} width={w} height={50} rx={0}
                  fill={isActive ? `${groupColors[i]}15` : 'transparent'}
                  stroke={isActive ? groupColors[i] : 'transparent'} strokeWidth={1} />
                <circle cx={x + w / 2} cy={timelineY} r={isActive ? 8 : 5}
                  fill={groupColors[i]} opacity={isActive ? 1 : 0.3} />
                <text x={x + w / 2} y={timelineY - 32}
                  fill={isActive ? groupColors[i] : 'rgba(255,255,255,0.3)'}
                  fontSize={12} textAnchor="middle" fontWeight="bold"
                  fontFamily="var(--font-hind-siliguri)">
                  {TENSE_GROUPS_BN[i]}
                </text>
                <text x={x + w / 2} y={timelineY + 28}
                  fill={isActive ? groupColors[i] : 'rgba(255,255,255,0.2)'}
                  fontSize={10} textAnchor="middle" fontFamily="monospace">
                  {g}
                </text>
              </g>
            );
          })}

          {/* Arrow markers */}
          <polygon points="48,115 48,125 38,120" fill="rgba(255,255,255,0.2)" />
          <polygon points="752,115 752,125 762,120" fill="rgba(255,255,255,0.2)" />
          <text x={30} y={timelineY + 3} fill="rgba(255,255,255,0.15)" fontSize={9} textAnchor="end">অতীত</text>
          <text x={770} y={timelineY + 3} fill="rgba(255,255,255,0.15)" fontSize={9}>ভবিষ্যৎ</text>

          {/* NOW marker */}
          <line x1={400} y1={timelineY - 20} x2={400} y2={timelineY + 20}
            stroke="rgba(251,191,36,0.5)" strokeWidth={2} strokeDasharray="3,3" />
          <text x={400} y={timelineY + 40} fill="rgba(251,191,36,0.5)" fontSize={9}
            textAnchor="middle" fontFamily="monospace">NOW</text>

          {/* Selected tense details */}
          <g>
            {/* Tense name */}
            <rect x={200} y={180} width={400} height={44} rx={22}
              fill={`${tense.color}20`} stroke={tense.color} strokeWidth={1.5} />
            <text x={400} y={200} fill={tense.color} fontSize={14}
              textAnchor="middle" fontWeight="bold" fontFamily="var(--font-hind-siliguri)">
              {tense.nameBn}
            </text>
            <text x={400} y={216} fill={`${tense.color}AA`} fontSize={11}
              textAnchor="middle" fontFamily="monospace">
              {tense.name}
            </text>

            {/* Formula */}
            <rect x={180} y={245} width={440} height={40} rx={8}
              fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
            <text x={400} y={268} fill={tense.color} fontSize={16}
              textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              {tense.formula}
            </text>
            <text x={200} y={268} fill="rgba(255,255,255,0.4)" fontSize={10}
              fontFamily="var(--font-hind-siliguri)">গঠন:</text>

            {/* Example */}
            <text x={400} y={320} fill="rgba(255,255,255,0.8)" fontSize={18}
              textAnchor="middle" fontWeight="bold" fontFamily="monospace">
              {tense.example}
            </text>
            <text x={400} y={345} fill="rgba(255,255,255,0.4)" fontSize={13}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
              {tense.exampleBn}
            </text>
          </g>

          {/* 12 Tenses grid (bottom) */}
          <g>
            <text x={400} y={395} fill="rgba(255,255,255,0.4)" fontSize={11}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              ১২টি টেন্স — সম্পূর্ণ তালিকা
            </text>

            {TENSES.map((grp, gi) => (
              grp.map((t, si) => {
                const cellW = 175;
                const cellH = 36;
                const gapX = 8;
                const gapY = 6;
                const startX = 400 - (3 * cellW + 2 * gapX) / 2;
                const px = startX + gi * (cellW + gapX);
                const py = 410 + si * (cellH + gapY);
                const isActive = gi === group && si === subType;

                return (
                  <g key={`${gi}-${si}`} style={{ cursor: 'pointer' }}
                    onClick={() => { setVariable('tenseGroup', gi); setVariable('subType', si); }}>
                    <rect x={px} y={py} width={cellW} height={cellH} rx={6}
                      fill={isActive ? `${t.color}25` : 'rgba(255,255,255,0.02)'}
                      stroke={isActive ? t.color : 'rgba(255,255,255,0.06)'}
                      strokeWidth={isActive ? 1.5 : 0.5} />
                    <text x={px + cellW / 2} y={py + 15}
                      fill={isActive ? t.color : 'rgba(255,255,255,0.35)'}
                      fontSize={9} textAnchor="middle" fontWeight={isActive ? 'bold' : 'normal'}
                      fontFamily="var(--font-hind-siliguri)">
                      {t.nameBn}
                    </text>
                    <text x={px + cellW / 2} y={py + 28}
                      fill={isActive ? `${t.color}CC` : 'rgba(255,255,255,0.2)'}
                      fontSize={8} textAnchor="middle" fontFamily="monospace">
                      {t.name}
                    </text>
                  </g>
                );
              })
            ))}

            {/* Column headers */}
            {TENSE_GROUPS_BN.map((name, i) => {
              const cellW = 175;
              const gapX = 8;
              const startX = 400 - (3 * cellW + 2 * gapX) / 2;
              return (
                <text key={i} x={startX + i * (cellW + gapX) + cellW / 2} y={406}
                  fill={groupColors[i]} fontSize={9} textAnchor="middle"
                  fontFamily="var(--font-hind-siliguri)" opacity={0.6}>
                  {name}
                </text>
              );
            })}

            {/* Row headers */}
            {SUB_TYPES_BN.map((name, i) => {
              const cellH = 36;
              const gapY = 6;
              const cellW = 175;
              const gapX = 8;
              const startX = 400 - (3 * cellW + 2 * gapX) / 2;
              return (
                <text key={i} x={startX - 8} y={410 + i * (cellH + gapY) + 20}
                  fill="rgba(255,255,255,0.25)" fontSize={8} textAnchor="end"
                  fontFamily="var(--font-hind-siliguri)">
                  {name}
                </text>
              );
            })}
          </g>

          <text x={400} y={25} fill="rgba(255,255,255,0.06)" fontSize={16}
            textAnchor="middle" fontFamily="var(--font-hind-siliguri)">কাল — টেন্স টাইমলাইন</text>
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
