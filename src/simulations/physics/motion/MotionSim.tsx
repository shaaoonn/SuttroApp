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
import VehiclePicker from './components/VehiclePicker';
import { motionConfig } from './config';
import type { VariableKey } from './types';

// ─────────────────────────────────────────────
// গতি Sim - Main entry component
// Mobile-first responsive layout
// ─────────────────────────────────────────────

const ALL_VARS: VariableKey[] = ['u', 'v', 'a', 's', 't'];

const VAR_LABELS_BN: Record<VariableKey, string> = {
  u: 'আদিবেগ u',
  v: 'শেষবেগ v',
  a: 'ত্বরণ a',
  s: 'সরণ s',
  t: 'সময় t',
};

export default function MotionSim() {
  const { state, derived, actions } = useMotion();
  const { equationDef, variant, duration, liveTime, liveS, liveV } = derived;

  const isFreefall = state.equation === 'freefall';
  const activeVars = equationDef.vars;

  return (
    <div
      className="motion-sim relative w-full"
      style={{
        background: 'linear-gradient(180deg, #0B1D3A 0%, #050D1F 100%)',
        color: '#FAFBF9',
        minHeight: 'min(720px, calc(100vh - 60px))',
      }}
    >
      {/* ─── Top bar ─── */}
      <div
        className="flex items-center justify-between px-3 py-2 lg:px-4 lg:py-3 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="text-base lg:text-lg font-bold"
            style={{ color: '#FAFBF9' }}
          >
            গতি
          </div>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: 'rgba(232, 168, 56, 0.15)',
              color: '#E8A838',
              border: '1px solid rgba(232, 168, 56, 0.3)',
            }}
          >
            NCTB অধ্যায় ২
          </span>
        </div>
        <ModeSwitch mode={state.mode} onChange={actions.setMode} />
      </div>

      {/* ─── Equation tabs ─── */}
      <div className="px-3 py-2 lg:px-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
        <EquationTabs current={state.equation} onChange={actions.setEquation} />
      </div>

      {/* ─── Main responsive grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3 lg:gap-4 p-3 lg:p-4">
        {/* ─── LEFT panel: controls ─── */}
        <div className="flex flex-col gap-2.5 lg:gap-3 lg:order-1 order-2">
          {/* Formula dropdown (solver mode) */}
          {state.mode === 'solver' && (
            <FormulaDropdown
              equation={equationDef}
              variantIndex={state.variantIndex}
              onChange={actions.setVariant}
            />
          )}

          {/* Step derivation */}
          {state.mode === 'solver' && <StepDerivation variant={variant} />}

          {/* Sliders for each active variable */}
          <div className="grid grid-cols-2 gap-2">
            {ALL_VARS.filter((v) => activeVars.includes(v) || (state.mode === 'solver' && state.unknown === v)).map((key) => {
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

          {/* Result + error */}
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

          {/* Vehicle picker */}
          <div>
            <div
              className="text-[10px] mb-1 opacity-60"
              style={{ color: '#FAFBF9' }}
            >
              বস্তু নির্বাচন
            </div>
            <VehiclePicker current={state.vehicle} onChange={actions.setVehicle} />
          </div>

          {/* Layer toggles */}
          <div>
            <div
              className="text-[10px] mb-1 opacity-60"
              style={{ color: '#FAFBF9' }}
            >
              লেয়ার
            </div>
            <LayerToggles
              layers={state.layers}
              onToggle={actions.toggleLayer}
              isFreefall={isFreefall}
            />
          </div>
        </div>

        {/* ─── RIGHT panel: scene + graphs + playback ─── */}
        <div className="flex flex-col gap-2.5 lg:gap-3 lg:order-2 order-1">
          {/* Scene Canvas */}
          <div className="w-full" style={{ height: 'clamp(180px, 38vh, 360px)' }}>
            {isFreefall ? (
              <FreeFallScene
                values={state.values}
                vehicle={state.vehicle}
                liveTime={liveTime}
                liveS={liveS}
                liveV={liveV}
                duration={duration}
                layers={state.layers}
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
              />
            )}
          </div>

          {/* Playback bar */}
          <PlaybackBar
            status={state.playback.status}
            speed={state.playback.speed}
            onPlay={actions.play}
            onPause={actions.pause}
            onReset={actions.reset}
            onSpeedChange={actions.setSpeed}
            onSaveGhost={actions.saveGhost}
            ghostCount={state.ghosts.length}
            onClearGhosts={actions.clearGhosts}
          />

          {/* Graphs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
        </div>
      </div>

      {/* Tutorial video FAB (placeholder until YT channel is created) */}
      <TutorialFAB />
    </div>
  );
}
