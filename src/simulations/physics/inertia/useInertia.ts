'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import { computeDuration, defaultVarsFor, validate } from './physics';
import type {
  InertiaState,
  InertiaVars,
  LayerVisibility,
  Mode,
  ScenarioKey,
  VariableKey,
} from './types';

// ─────────────────────────────────────────────
// জড়তা Sim — state hook
// ─────────────────────────────────────────────

const initialState: InertiaState = {
  mode: 'solver',
  scenario: 'busBrake',
  values: defaultVarsFor('busBrake'),
  playback: { status: 'idle', elapsedMs: 0 },
  zoom: 1,
  layers: {
    velocityArrow: true,
    forceArrow: true,
    distanceMarkers: true,
    inertiaIndicator: true,
  },
  error: null,
};

type Action =
  | { type: 'SET_MODE'; mode: Mode }
  | { type: 'SET_SCENARIO'; scenario: ScenarioKey }
  | { type: 'SET_VALUE'; key: VariableKey; value: number }
  | { type: 'TOGGLE_LAYER'; key: keyof LayerVisibility }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK'; elapsedMs: number }
  | { type: 'FINISH' }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_VALUES'; values: InertiaVars }
  | { type: 'VALIDATE' };

function reducer(state: InertiaState, action: Action): InertiaState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_SCENARIO':
      return {
        ...state,
        scenario: action.scenario,
        values: defaultVarsFor(action.scenario),
        playback: { status: 'idle', elapsedMs: 0 },
        error: null,
      };

    case 'SET_VALUE':
      return {
        ...state,
        values: { ...state.values, [action.key]: action.value },
        playback: { ...state.playback, status: 'idle', elapsedMs: 0 },
      };

    case 'SET_VALUES':
      return {
        ...state,
        values: action.values,
        playback: { status: 'idle', elapsedMs: 0 },
        error: null,
      };

    case 'TOGGLE_LAYER':
      return {
        ...state,
        layers: { ...state.layers, [action.key]: !state.layers[action.key] },
      };

    case 'PLAY':
      if (state.playback.status === 'finished') {
        return { ...state, playback: { status: 'playing', elapsedMs: 0 } };
      }
      return { ...state, playback: { ...state.playback, status: 'playing' } };

    case 'PAUSE':
      return { ...state, playback: { ...state.playback, status: 'paused' } };

    case 'RESET':
      return { ...state, playback: { status: 'idle', elapsedMs: 0 } };

    case 'TICK':
      return { ...state, playback: { ...state.playback, elapsedMs: action.elapsedMs } };

    case 'FINISH':
      return { ...state, playback: { ...state.playback, status: 'finished' } };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.5, Math.min(2.5, action.zoom)) };

    case 'VALIDATE': {
      const err = validate(state.values);
      return { ...state, error: err };
    }

    default:
      return state;
  }
}

export function useInertia() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const elapsedAccumRef = useRef<number>(0);

  // Validate on value change
  useEffect(() => {
    dispatch({ type: 'VALIDATE' });
  }, [state.values]);

  // Animation rAF loop — always 1× wall-clock
  useEffect(() => {
    const isPlaying = state.playback.status === 'playing';
    const duration = computeDuration(state.scenario, state.values);
    const durationMs = duration * 1000;

    if (!isPlaying) {
      lastTsRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    elapsedAccumRef.current = state.playback.elapsedMs;

    const tick = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      elapsedAccumRef.current += dt;

      if (elapsedAccumRef.current >= durationMs) {
        dispatch({ type: 'TICK', elapsedMs: durationMs });
        dispatch({ type: 'FINISH' });
        return;
      }
      dispatch({ type: 'TICK', elapsedMs: elapsedAccumRef.current });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTsRef.current = null;
    };
  }, [state.playback.status, state.scenario, state.values]);

  // Action callbacks
  const setMode = useCallback((mode: Mode) => dispatch({ type: 'SET_MODE', mode }), []);
  const setScenario = useCallback(
    (scenario: ScenarioKey) => dispatch({ type: 'SET_SCENARIO', scenario }),
    []
  );
  const setValue = useCallback(
    (key: VariableKey, value: number) => dispatch({ type: 'SET_VALUE', key, value }),
    []
  );
  const setValues = useCallback(
    (values: InertiaVars) => dispatch({ type: 'SET_VALUES', values }),
    []
  );
  const toggleLayer = useCallback(
    (key: keyof LayerVisibility) => dispatch({ type: 'TOGGLE_LAYER', key }),
    []
  );
  const play = useCallback(() => dispatch({ type: 'PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setZoom = useCallback((z: number) => dispatch({ type: 'SET_ZOOM', zoom: z }), []);

  // Derived
  const duration = computeDuration(state.scenario, state.values);
  const liveTime = state.playback.elapsedMs / 1000;

  return {
    state,
    derived: { duration, liveTime },
    actions: {
      setMode,
      setScenario,
      setValue,
      setValues,
      toggleLayer,
      play,
      pause,
      reset,
      setZoom,
    },
  };
}

export type UseInertiaReturn = ReturnType<typeof useInertia>;
