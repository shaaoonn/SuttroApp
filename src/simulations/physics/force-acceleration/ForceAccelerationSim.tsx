'use client';

import { useEffect, useRef, useState } from 'react';
import ModeSwitch from '@/simulations/physics/motion/components/ModeSwitch';
import SimSettings from '@/simulations/physics/motion/components/SimSettings';
import TutorialFAB from '@/simulations/physics/motion/components/TutorialFAB';
import CartPushScene from './components/CartPushScene';
import ForceSliders from './components/ForceSliders';
import ForceTypesPanel from './components/ForceTypesPanel';
import ImpulseScene from './components/ImpulseScene';
import LayerToggles from './components/LayerToggles';
import MomentumScene from './components/MomentumScene';
import PresetButtons from './components/PresetButtons';
import ResultPanel from './components/ResultPanel';
import ScenarioQuestion from './components/ScenarioQuestion';
import ScenarioTabs from './components/ScenarioTabs';
import WeightScene from './components/WeightScene';
import { forceAccelerationConfig } from './config';
import { useForce } from './useForce';

const SUBJECT_BN: Record<string, string> = {
  physics: 'পদার্থবিজ্ঞান',
  chemistry: 'রসায়ন',
  biology: 'জীববিজ্ঞান',
  math: 'গণিত',
  'higher-math': 'উচ্চতর গণিত',
  english: 'ইংরেজি',
};

export interface ForceAccelerationSimProps {
  videoUrl?: string;
}

export default function ForceAccelerationSim({ videoUrl }: ForceAccelerationSimProps = {}) {
  const { state, derived, actions } = useForce();
  const { liveTime, duration } = derived;

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handler = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      if (!isFs) {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.()
        .then(() => {
          const isMobile =
            typeof navigator !== 'undefined' && /Mobi|Android|iPhone/i.test(navigator.userAgent);
          if (isMobile && screen.orientation && 'lock' in screen.orientation) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (screen.orientation as any).lock?.('landscape').catch(() => {});
          }
        })
        .catch(() => {});
    } else {
      if (screen.orientation && 'unlock' in screen.orientation) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (screen.orientation as any).unlock?.();
      }
      document.exitFullscreen().catch(() => {});
    }
  };

  const sceneCommonProps = {
    values: state.values,
    liveTime,
    duration,
    zoom: state.zoom,
    layers: state.layers,
    distanceUnit: state.distanceUnit,
    playbackStatus: state.playback.status,
    onPlay: actions.play,
    onPause: actions.pause,
    onReset: actions.reset,
    onZoomChange: actions.setZoom,
    onToggleFullscreen: toggleFullscreen,
    isFullscreen,
  };

  let sceneNode: React.ReactNode;
  if (state.scenario === 'cartPush') sceneNode = <CartPushScene {...sceneCommonProps} />;
  else if (state.scenario === 'momentum') sceneNode = <MomentumScene {...sceneCommonProps} />;
  else if (state.scenario === 'impulse') sceneNode = <ImpulseScene {...sceneCommonProps} />;
  else if (state.scenario === 'weight')
    sceneNode = (
      <WeightScene
        {...sceneCommonProps}
        planet={state.planet}
        onPlanetChange={actions.setPlanet}
      />
    );
  else sceneNode = <ForceTypesPanel />;

  // Sliders not needed for forceTypes (informational tab)
  const showSliders = state.scenario !== 'forceTypes';

  return (
    <div
      ref={containerRef}
      className="force-sim relative w-full flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #FFF8E7 0%, #DBEAFE 50%, #F0F9FF 100%)',
        color: '#1E293B',
      }}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2 lg:px-5 lg:py-2.5 flex-shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.78)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-baseline lg:gap-3 min-w-0 flex-1">
          <div
            className="text-[10px] font-medium leading-none truncate lg:hidden"
            style={{ color: '#94A3B8' }}
          >
            {SUBJECT_BN[forceAccelerationConfig.subject]} · অধ্যায় {forceAccelerationConfig.nctb.chapter}
          </div>
          <div
            className="font-bold leading-tight truncate text-xl lg:hidden"
            style={{ color: '#1E293B' }}
          >
            {forceAccelerationConfig.title.bn}
          </div>
          <div className="hidden lg:flex items-baseline gap-3 truncate">
            <span className="text-3xl font-bold tracking-tight" style={{ color: '#1E293B' }}>
              {forceAccelerationConfig.title.bn}
            </span>
            <span className="text-sm" style={{ color: '#94A3B8' }}>
              {SUBJECT_BN[forceAccelerationConfig.subject]} · NCTB অধ্যায় {forceAccelerationConfig.nctb.chapter} · ২য় সূত্র
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SimSettings
            textScale={state.textScale}
            onTextScaleChange={actions.setTextScale}
            distanceUnit={state.distanceUnit}
            onDistanceUnitChange={actions.setDistanceUnit}
          />
          <ModeSwitch mode={state.mode} onChange={actions.setMode} />
        </div>
      </div>

      {/* Scenario tabs */}
      <div className="px-3 py-2 lg:px-5 lg:py-2 flex-shrink-0">
        <ScenarioTabs current={state.scenario} onChange={actions.setScenario} />
      </div>

      {/* Main grid */}
      <div className="flex flex-col lg:flex-row gap-2 lg:gap-3 px-3 lg:px-5 pb-3 lg:pb-4">
        {/* Scene */}
        <div className="flex flex-col gap-2 lg:flex-1 lg:min-w-0">
          <div
            className="rounded-xl lg:rounded-2xl overflow-hidden w-full mx-auto aspect-[4/5] lg:aspect-[16/9] relative"
            style={{
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.85)',
              maxHeight: '720px',
            }}
          >
            {sceneNode}
            {showSliders && (
              <ForceSliders
                scenario={state.scenario}
                values={state.values}
                onChange={actions.setValue}
                textScale={state.textScale}
              />
            )}
          </div>
        </div>

        {/* Right panel */}
        <div
          className="flex flex-col gap-2 lg:w-[360px] flex-shrink-0 lg:overflow-y-auto lg:max-h-[calc(100vh-180px)] lg:pr-1"
          style={{ zoom: state.textScale }}
        >
          <ScenarioQuestion scenario={state.scenario} values={state.values} />

          {state.scenario !== 'forceTypes' && (
            <PresetButtons
              scenario={state.scenario}
              onApply={actions.setValues}
              onPlanetChange={actions.setPlanet}
            />
          )}

          {state.scenario !== 'forceTypes' && (
            <ResultPanel
              scenario={state.scenario}
              values={state.values}
              liveTime={liveTime}
            />
          )}

          {state.error && (
            <div
              className="rounded-xl px-3 py-2 text-xs flex items-start gap-2"
              style={{
                background: '#FEF2F2',
                border: '1.5px solid #FCA5A5',
                color: '#B91C1C',
              }}
            >
              <span>⚠</span>
              <span style={{ fontWeight: 500 }}>{state.error.message}</span>
            </div>
          )}

          {state.scenario !== 'forceTypes' && (
            <div>
              <div
                className="text-[10px] mb-1 font-semibold"
                style={{ color: '#94A3B8' }}
              >
                লেয়ার
              </div>
              <LayerToggles layers={state.layers} onToggle={actions.toggleLayer} />
            </div>
          )}

          {/* Related formulas reference */}
          <div
            className="rounded-xl p-3"
            style={{
              background: '#F0FDF4',
              border: '1px solid #86EFAC',
            }}
          >
            <div className="text-xs font-bold mb-2" style={{ color: '#166534' }}>
              📚 সম্পর্কিত সূত্র
            </div>
            <div className="space-y-1.5 font-mono text-xs" style={{ color: '#15803D' }}>
              {forceAccelerationConfig.formulas.map((f, i) => (
                <div key={i}>
                  <div className="font-bold">{f.expression}</div>
                  <div className="text-[10px] font-sans" style={{ color: '#475569' }}>
                    {f.description.bn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <TutorialFAB videoUrl={videoUrl} />
    </div>
  );
}
