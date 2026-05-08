'use client';

import { useMotion } from './useMotion';
import EquationTabs from './components/EquationTabs';
import ErrorBanner from './components/ErrorBanner';
import FormulaDropdown from './components/FormulaDropdown';
import FreeFallScene from './components/FreeFallScene';
import KinematicGraph from './components/KinematicGraph';
import LayerToggles from './components/LayerToggles';
import ModeSwitch from './components/ModeSwitch';
import PlaybackBar from './components/PlaybackBar';
import ResultDisplay from './components/ResultDisplay';
import RoadScene from './components/RoadScene';
import StepDerivation from './components/StepDerivation';
import TutorialFAB from './components/TutorialFAB';
import ValueSlider from './components/ValueSlider';
import { motionConfig } from './config';
import type { VariableKey } from './types';

// ─────────────────────────────────────────────
// গতি Sim — single-viewport, scene-first.
// Mobile: compact, scene fixed aspect ratio.
// Desktop: scene LEFT (flex-1), controls RIGHT (380px).
// Play/Reset overlaid on scene canvas (SceneOverlayControls).
// ─────────────────────────────────────────────

const ALL_VARS: VariableKey[] = ['u', 'v', 'a', 's', 't'];

const VAR_LABELS_BN: Record<VariableKey, string> = {
  u: 'আদিবেগ u',
  v: 'শেষবেগ v',
  a: 'ত্বরণ a',
  s: 'সরণ s',
  t: 'সময় t',
};

export interface MotionSimProps {
  videoUrl?: string;
}

export default function MotionSim({ videoUrl }: MotionSimProps = {}) {
  const { state, derived, actions } = useMotion();
  const { equationDef, variant, duration, liveTime, liveS, liveV } = derived;

  const isFreefall = state.equation === 'freefall';
  const activeVars = equationDef.vars;

  return (
    <div
      className="motion-sim relative w-full flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #FFF8E7 0%, #DBEAFE 50%, #F0F9FF 100%)',
        color: '#1E293B',
      }}
    >
      {/* ─── Top bar ─── */}
      <div
        className="flex items-center justify-between gap-2 px-2.5 py-1.5 lg:px-5 lg:py-2.5 flex-shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        <div className="flex items-center gap-1.5 lg:gap-2">
          <div className="text-sm lg:text-lg font-bold" style={{ color: '#1E293B' }}>
            গতি
          </div>
          <span
            className="text-[9px] lg:text-[10px] px-1.5 py-0.5 rounded-full font-semibold hidden xs:inline-block"
            style={{
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
            }}
          >
            NCTB অধ্যায় ২
          </span>
        </div>
        <ModeSwitch mode={state.mode} onChange={actions.setMode} />
      </div>

      {/* ─── Equation tabs ─── */}
      <div className="px-2.5 py-1.5 lg:px-5 lg:py-2 flex-shrink-0">
        <EquationTabs current={state.equation} onChange={actions.setEquation} />
      </div>

      {/* ─── Main: scene + controls ─── */}
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 px-2.5 lg:px-5 pb-2.5 lg:pb-4 lg:flex-1 lg:min-h-0">
        {/* SCENE column */}
        <div className="flex flex-col gap-1.5 lg:gap-2 lg:flex-1 lg:min-w-0">
          <div
            className="rounded-xl lg:rounded-2xl overflow-hidden aspect-[16/10] lg:aspect-auto lg:flex-1"
            style={{
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              minHeight: '220px',
            }}
          >
            {isFreefall ? (
              <FreeFallScene
                values={state.values}
                vehicle={state.vehicle}
                liveTime={liveTime}
                liveS={liveS}
                liveV={liveV}
                duration={duration}
                layers={state.layers}
                onVehicleChange={actions.setVehicle}
                playbackStatus={state.playback.status}
                onPlay={actions.play}
                onPause={actions.pause}
                onReset={actions.reset}
              />
            ) : (
              <RoadScene
                values={state.values}
                vehicle={state.vehicle}
                liveTime={liveTime}
                liveS={liveS}
                liveV={liveV}
                duration={duration}
                layers={state.layers}
                ghosts={state.ghosts}
                onVehicleChange={actions.setVehicle}
                playbackStatus={state.playback.status}
                onPlay={actions.play}
                onPause={actions.pause}
                onReset={actions.reset}
              />
            )}
          </div>

          {/* Playback bar — speed + ghost only (Play/Reset are overlaid on scene) */}
          <PlaybackBar
            speed={state.playback.speed}
            onSpeedChange={actions.setSpeed}
            onSaveGhost={actions.saveGhost}
            ghostCount={state.ghosts.length}
            onClearGhosts={actions.clearGhosts}
          />
        </div>

        {/* CONTROLS column */}
        <div
          className="flex flex-col gap-1.5 lg:gap-2 lg:w-[360px] flex-shrink-0 lg:overflow-y-auto lg:max-h-[calc(100vh-130px)] lg:pr-1"
        >
          {state.mode === 'solver' && (
            <FormulaDropdown
              equation={equationDef}
              variantIndex={state.variantIndex}
              onChange={actions.setVariant}
            />
          )}

          {state.mode === 'solver' && <StepDerivation variant={variant} />}

          <div className="grid grid-cols-2 gap-1.5 lg:gap-2">
            {ALL_VARS.filter(
              (v) =>
                activeVars.includes(v) ||
                (state.mode === 'solver' && state.unknown === v),
            ).map((key) => {
              const cfg = motionConfig.variables.find((c) => c.id === key)!;
              const isUnknown = state.mode === 'solver' && state.unknown === key;
              const isActive = activeVars.includes(key);
              return (
                <ValueSlider
                  key={key}
                  varKey={key}
                  label={VAR_LABELS_BN[key]}
                  unit={cfg.unit}
                  value={state.values[key]}
                  min={cfg.min}
                  max={cfg.max}
                  step={cfg.step}
                  isUnknown={isUnknown}
                  isHighlighted={isActive && !isUnknown}
                  onChange={(v) => actions.setValue(key, v)}
                />
              );
            })}
          </div>

          <ResultDisplay
            liveTime={liveTime}
            liveV={liveV}
            liveS={liveS}
            unknown={state.unknown}
            values={state.values}
            lastResult={state.lastResult}
            error={state.error}
            mode={state.mode}
          />

          <ErrorBanner error={state.error} />

          <div>
            <div
              className="text-[9px] lg:text-[10px] mb-1 font-semibold"
              style={{ color: '#94A3B8' }}
            >
              লেয়ার
            </div>
            <LayerToggles
              layers={state.layers}
              onToggle={actions.toggleLayer}
              isFreefall={isFreefall}
            />
          </div>

          {/* Mini graphs */}
          {(state.layers.vGraph || state.layers.sGraph) && (
            <div className="grid grid-cols-1 gap-1.5 lg:gap-2">
              {state.layers.vGraph && (
                <KinematicGraph
                  variant="velocity"
                  values={state.values}
                  duration={duration}
                  liveTime={liveTime}
                  isFreefall={isFreefall}
                />
              )}
              {state.layers.sGraph && (
                <KinematicGraph
                  variant="displacement"
                  values={state.values}
                  duration={duration}
                  liveTime={liveTime}
                  isFreefall={isFreefall}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <TutorialFAB videoUrl={videoUrl} />
    </div>
  );
}
