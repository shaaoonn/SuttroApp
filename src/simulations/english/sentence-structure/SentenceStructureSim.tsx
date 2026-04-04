'use client';

import { useRef, useState, useCallback } from 'react';
import { sentenceStructureConfig, SENTENCES } from './config';
import { usePanZoom } from '@/hooks/usePanZoom';
import { useInteractionMode } from '@/hooks/useInteractionMode';
import { useSimNarration, useSoundToggle } from '@/hooks/useSimNarration';
import { SIM_NARRATIONS } from '@/data/simNarrations';
import PlayerShell from '@/components/player/PlayerShell';
import PanZoomContainer from '@/components/simulation/PanZoomContainer';
import ControlPanel from '@/components/player/ControlPanel';
import FormulaDisplay from '@/components/player/FormulaDisplay';
import type { VariableConfig } from '@/simulations/_template/config';

// ─────────────────────────────────────────────
// বাক্য গঠন (Sentence Structure — SVO)
// Interactive sentence parsing visualization
// ─────────────────────────────────────────────

export default function SentenceStructureSim() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const config = sentenceStructureConfig;

  const initialVars: Record<string, number> = {};
  config.variables.forEach((v: VariableConfig) => { initialVars[v.id] = v.default; });
  const [variables, setVariables] = useState<Record<string, number>>(initialVars);
  const setVariable = useCallback((id: string, value: number) => {
    setVariables((prev) => ({ ...prev, [id]: value }));
  }, []);
  const resetAll = useCallback(() => { setVariables(initialVars); }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const panZoom = usePanZoom(config.defaultZoom, config.canvasSize, viewportRef);
  const { soundEnabled, toggleSound } = useSoundToggle();
  useSimNarration({ template: SIM_NARRATIONS['sentence-structure'], values: variables, soundEnabled });
  const interaction = useInteractionMode();

  const sentenceIdx = Math.round(variables.sentenceType ?? 0);
  const sentence = SENTENCES[sentenceIdx] || SENTENCES[0];

  return (
    <PlayerShell
      topBar={{ subject: config.subject, chapter: config.nctb.chapter, title: config.title.bn }}
      panZoom={{ zoom: panZoom.zoom, zoomIn: panZoom.zoomIn, zoomOut: panZoom.zoomOut, fitToScreen: panZoom.fitToScreen }}
      interactionMode={{ effectiveMode: interaction.effectiveMode, setMouseMode: interaction.setMouseMode, setHandMode: interaction.setHandMode }}
      sound={{ enabled: soundEnabled, toggle: toggleSound }}
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

          {/* Sentence type badge */}
          <rect x={300} y={30} width={200} height={36} rx={18}
            fill="rgba(8,145,178,0.15)" stroke="rgba(8,145,178,0.4)" strokeWidth={1.5} />
          <text x={400} y={53} fill="rgba(8,145,178,0.9)" fontSize={13}
            textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
            {sentence.typeBn} ({sentence.type})
          </text>

          {/* Full sentence */}
          <text x={400} y={110} fill="rgba(255,255,255,0.85)" fontSize={22}
            textAnchor="middle" fontWeight="bold" fontFamily="monospace">
            {sentence.sentence}
          </text>

          {/* Bangla translation */}
          <text x={400} y={140} fill="rgba(255,255,255,0.4)" fontSize={14}
            textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
            {sentence.bangla}
          </text>

          {/* Parts breakdown */}
          {sentence.parts.map((part, i) => {
            const partW = 160;
            const gap = 20;
            const totalW = sentence.parts.length * partW + (sentence.parts.length - 1) * gap;
            const startX = 400 - totalW / 2;
            const px = startX + i * (partW + gap);
            const py = 200;

            return (
              <g key={i}>
                {/* Connection line to sentence */}
                <line x1={px + partW / 2} y1={155} x2={px + partW / 2} y2={py}
                  stroke={part.color} strokeWidth={1.5} strokeDasharray="4,3" opacity={0.4} />

                {/* Part box */}
                <rect x={px} y={py} width={partW} height={80} rx={10}
                  fill={`${part.color}15`} stroke={part.color} strokeWidth={1.5} opacity={0.8} />

                {/* Word */}
                <text x={px + partW / 2} y={py + 28} fill={part.color} fontSize={15}
                  textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                  {part.text}
                </text>

                {/* Role English */}
                <text x={px + partW / 2} y={py + 48} fill={`${part.color}AA`} fontSize={10}
                  textAnchor="middle" fontFamily="monospace">
                  {part.role}
                </text>

                {/* Role Bangla */}
                <text x={px + partW / 2} y={py + 66} fill={`${part.color}88`} fontSize={11}
                  textAnchor="middle" fontFamily="var(--font-hind-siliguri)">
                  {part.roleBn}
                </text>

                {/* Arrow between parts */}
                {i < sentence.parts.length - 1 && (
                  <text x={px + partW + gap / 2} y={py + 40} fill="rgba(255,255,255,0.2)"
                    fontSize={18} textAnchor="middle" fontFamily="monospace">
                    →
                  </text>
                )}
              </g>
            );
          })}

          {/* SVO structure diagram */}
          <g>
            <rect x={200} y={340} width={400} height={60} rx={10}
              fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />

            <text x={400} y={365} fill="rgba(255,255,255,0.5)" fontSize={12}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              বাক্যের মৌলিক কাঠামো
            </text>

            <text x={400} y={390} fill="rgba(255,255,255,0.7)" fontSize={16}
              textAnchor="middle" fontFamily="monospace">
              <tspan fill="#60A5FA">Subject</tspan>
              <tspan fill="rgba(255,255,255,0.3)"> + </tspan>
              <tspan fill="#F87171">Verb</tspan>
              <tspan fill="rgba(255,255,255,0.3)"> + </tspan>
              <tspan fill="#34D399">Object</tspan>
            </text>
          </g>

          {/* All sentence types list */}
          <g>
            <rect x={50} y={430} width={700} height={130} rx={10}
              fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />

            <text x={400} y={455} fill="rgba(255,255,255,0.4)" fontSize={11}
              textAnchor="middle" fontFamily="var(--font-hind-siliguri)" fontWeight="bold">
              বাক্যের প্রকারভেদ
            </text>

            {SENTENCES.map((s, i) => {
              const isActive = i === sentenceIdx;
              const tx = 80 + (i % 3) * 240;
              const ty = 480 + Math.floor(i / 3) * 35;
              return (
                <g key={i} style={{ cursor: 'pointer' }}
                  onClick={() => setVariable('sentenceType', i)}>
                  <rect x={tx - 5} y={ty - 14} width={220} height={26} rx={6}
                    fill={isActive ? 'rgba(8,145,178,0.15)' : 'transparent'}
                    stroke={isActive ? 'rgba(8,145,178,0.3)' : 'transparent'} strokeWidth={1} />
                  <circle cx={tx + 5} cy={ty} r={4}
                    fill={isActive ? 'rgba(8,145,178,0.8)' : 'rgba(255,255,255,0.15)'} />
                  <text x={tx + 16} y={ty + 4} fill={isActive ? 'rgba(8,145,178,0.8)' : 'rgba(255,255,255,0.35)'}
                    fontSize={11} fontFamily="var(--font-hind-siliguri)">
                    {s.typeBn} — {s.type}
                  </text>
                </g>
              );
            })}
          </g>

          <text x={400} y={25} fill="rgba(255,255,255,0.06)" fontSize={16}
            textAnchor="middle" fontFamily="var(--font-hind-siliguri)">বাক্য গঠন</text>
        </svg>
      </PanZoomContainer>
    </PlayerShell>
  );
}
