'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
  PLANET_GRAVITY,
  accelerationFrom,
  computeDuration,
  defaultPlanetFor,
  defaultVarsFor,
  validate,
} from './physics';
import type {
  DistanceUnit,
  ForceState,
  ForceVars,
  LayerVisibility,
  Mode,
  PlanetKey,
  ScenarioKey,
  VariableKey,
} from './types';

// LocalStorage keys
const LS_TEXT_SCALE = 'suttro:force:textScale';
const LS_DISTANCE_UNIT = 'suttro:force:distanceUnit';

function loadTextScale(): number {
  if (typeof window === 'undefined') return 1.0;
  const raw = localStorage.getItem(LS_TEXT_SCALE);
  const n = raw ? parseFloat(raw) : NaN;
  if (!Number.isFinite(n) || n < 0.6 || n > 2.0) return 1.0;
  return n;
}

function loadDistanceUnit(): DistanceUnit {
  if (typeof window === 'undefined') return 'm';
  const raw = localStorage.getItem(LS_DISTANCE_UNIT);
  return raw === 'cm' ? 'cm' : 'm';
}

const initialState: ForceState = {
  mode: 'solver',
  scenario: 'cartPush',
  values: defaultVarsFor('cartPush'),
  planet: 'earth',
  playback: { status: 'idle', elapsedMs: 0 },
  zoom: 1,
  textScale: 1.0,
  distanceUnit: 'm',
  layers: {
    forceArrow: true,
    netForceArrow: true,
    velocityArrow: true,
    accelArrow: true,
    values: true,
    distanceMarkers: true,
    speedometer: true,
  },
  error: null,
};

type Action =
  | { type: 'SET_MODE'; mode: Mode }
  | { type: 'SET_SCENARIO'; scenario: ScenarioKey }
  | { type: 'SET_VALUE'; key: VariableKey; value: number }
  | { type: 'SET_VALUES'; values: ForceVars }
  | { type: 'SET_PLANET'; planet: PlanetKey }
  | { type: 'TOGGLE_LAYER'; key: keyof LayerVisibility }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK'; elapsedMs: number }
  | { type: 'FINISH' }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_TEXT_SCALE'; scale: number }
  | { type: 'SET_DISTANCE_UNIT'; unit: DistanceUnit }
  | { type: 'VALIDATE' };

function reducer(state: ForceState, action: Action): ForceState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_SCENARIO': {
      return {
        ...state,
        scenario: action.scenario,
        values: defaultVarsFor(action.scenario),
        planet: defaultPlanetFor(action.scenario),
        playback: { status: 'idle', elapsedMs: 0 },
        error: null,
      };
    }

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

    case 'SET_PLANET':
      return {
        ...state,
        planet: action.planet,
        values: { ...state.values, g: PLANET_GRAVITY[action.planet] },
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

    case 'SET_TEXT_SCALE':
      return { ...state, textScale: Math.max(0.7, Math.min(1.8, action.scale)) };

    case 'SET_DISTANCE_UNIT':
      return { ...state, distanceUnit: action.unit };

    case 'VALIDATE':
      return { ...state, error: validate(state.values) };

    default:
      return state;
  }
}

export function useForce() {
  const [state, dispatch] = useReducer(reducer, initialState, (s) => ({
    ...s,
    textScale: loadTextScale(),
    distanceUnit: loadDistanceUnit(),
  }));
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const elapsedAccumRef = useRef<number>(0);

  // Validate on values change
  useEffect(() => {
    dispatch({ type: 'VALIDATE' });
  }, [state.values]);

  // Persist textScale + distanceUnit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_TEXT_SCALE, String(state.textScale));
    }
  }, [state.textScale]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_DISTANCE_UNIT, state.distanceUnit);
    }
  }, [state.distanceUnit]);

  // Animation loop
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

  const setMode = useCallback((m: Mode) => dispatch({ type: 'SET_MODE', mode: m }), []);
  const setScenario = useCallback(
    (s: ScenarioKey) => dispatch({ type: 'SET_SCENARIO', scenario: s }),
    [],
  );
  const setValue = useCallback(
    (key: VariableKey, value: number) => dispatch({ type: 'SET_VALUE', key, value }),
    [],
  );
  const setValues = useCallback(
    (values: ForceVars) => dispatch({ type: 'SET_VALUES', values }),
    [],
  );
  const setPlanet = useCallback(
    (p: PlanetKey) => dispatch({ type: 'SET_PLANET', planet: p }),
    [],
  );
  const toggleLayer = useCallback(
    (key: keyof LayerVisibility) => dispatch({ type: 'TOGGLE_LAYER', key }),
    [],
  );
  const play = useCallback(() => dispatch({ type: 'PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setZoom = useCallback((z: number) => dispatch({ type: 'SET_ZOOM', zoom: z }), []);
  const setTextScale = useCallback(
    (s: number) => dispatch({ type: 'SET_TEXT_SCALE', scale: s }),
    [],
  );
  const setDistanceUnit = useCallback(
    (u: DistanceUnit) => dispatch({ type: 'SET_DISTANCE_UNIT', unit: u }),
    [],
  );

  // Derived
  const duration = computeDuration(state.scenario, state.values);
  const liveTime = state.playback.elapsedMs / 1000;
  const a = accelerationFrom(state.values.F, state.values.m, state.values.mu, state.values.g);

  return {
    state,
    derived: { duration, liveTime, a },
    actions: {
      setMode, setScenario, setValue, setValues, setPlanet, toggleLayer,
      play, pause, reset, setZoom, setTextScale, setDistanceUnit,
    },
  };
}

export type UseForceReturn = ReturnType<typeof useForce>;
