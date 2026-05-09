'use client';

import { useReducer, useCallback, useEffect, useRef } from 'react';
import {
  EQUATIONS,
  G,
  computeDuration,
  defaultUnknownFor,
  defaultVarsFor,
  positionAt,
  solve,
  velocityAt,
} from './physics';
import type {
  EquationKey,
  GhostRun,
  KinematicVars,
  LayerVisibility,
  MotionState,
  PlaybackSpeed,
  VariableKey,
  VehicleKey,
} from './types';

// ─────────────────────────────────────────────
// গতি Sim - State management hook
// useReducer for predictable state, animation via rAF
// ─────────────────────────────────────────────

const GHOST_COLORS = ['#9CA3AF', '#FCD34D', '#F87171']; // up to 3 ghosts

const initialState: MotionState = {
  mode: 'solver',
  equation: 'first',
  variantIndex: 0,
  unknown: 'v',
  values: defaultVarsFor('first'),
  vehicle: 'sedan',
  playback: { status: 'idle', elapsedMs: 0, speed: 1 },
  layers: {
    velocityArrow: true,
    accelerationArrow: true,
    distanceMarkers: true,
    ghostTrail: true,
    vGraph: true,
    sGraph: false,
  },
  ghosts: [],
  error: null,
  lastResult: null,
  zoom: 1,
};

type Action =
  | { type: 'SET_MODE'; mode: MotionState['mode'] }
  | { type: 'SET_EQUATION'; equation: EquationKey }
  | { type: 'SET_VARIANT'; index: number }
  | { type: 'SET_VALUE'; key: VariableKey; value: number }
  | { type: 'SET_VEHICLE'; vehicle: VehicleKey }
  | { type: 'TOGGLE_LAYER'; key: keyof LayerVisibility }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'TICK'; elapsedMs: number }
  | { type: 'FINISH' }
  | { type: 'SET_SPEED'; speed: PlaybackSpeed }
  | { type: 'SAVE_GHOST' }
  | { type: 'CLEAR_GHOSTS' }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'RECOMPUTE' };

function reducer(state: MotionState, action: Action): MotionState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_EQUATION': {
      const newDefaults = defaultVarsFor(action.equation);
      const newUnknown =
        state.mode === 'solver' ? defaultUnknownFor(action.equation) : null;
      // Find variant that solves the new unknown
      const variantIndex =
        state.mode === 'solver'
          ? Math.max(
              0,
              EQUATIONS[action.equation].variants.findIndex(
                (v) => v.solves === newUnknown
              )
            )
          : 0;
      return {
        ...state,
        equation: action.equation,
        variantIndex,
        unknown: newUnknown,
        values: newDefaults,
        playback: { ...state.playback, status: 'idle', elapsedMs: 0 },
        error: null,
        lastResult: null,
      };
    }

    case 'SET_VARIANT': {
      const variant = EQUATIONS[state.equation].variants[action.index];
      if (!variant) return state;
      return {
        ...state,
        variantIndex: action.index,
        unknown: variant.solves,
        playback: { ...state.playback, status: 'idle', elapsedMs: 0 },
        error: null,
        lastResult: null,
      };
    }

    case 'SET_VALUE': {
      // Don't allow setting the unknown variable
      if (state.mode === 'solver' && state.unknown === action.key) return state;
      return {
        ...state,
        values: { ...state.values, [action.key]: action.value },
        playback: { ...state.playback, status: 'idle', elapsedMs: 0 },
      };
    }

    case 'SET_VEHICLE':
      return { ...state, vehicle: action.vehicle };

    case 'TOGGLE_LAYER':
      return {
        ...state,
        layers: { ...state.layers, [action.key]: !state.layers[action.key] },
      };

    case 'PLAY':
      // Reset elapsed if at finished state
      if (state.playback.status === 'finished') {
        return {
          ...state,
          playback: { ...state.playback, status: 'playing', elapsedMs: 0 },
        };
      }
      return {
        ...state,
        playback: { ...state.playback, status: 'playing' },
      };

    case 'PAUSE':
      return {
        ...state,
        playback: { ...state.playback, status: 'paused' },
      };

    case 'RESET':
      return {
        ...state,
        playback: { status: 'idle', elapsedMs: 0, speed: state.playback.speed },
      };

    case 'TICK':
      return {
        ...state,
        playback: { ...state.playback, elapsedMs: action.elapsedMs },
      };

    case 'FINISH':
      return {
        ...state,
        playback: { ...state.playback, status: 'finished' },
      };

    case 'SET_SPEED':
      return {
        ...state,
        playback: { ...state.playback, speed: action.speed },
      };

    case 'SAVE_GHOST': {
      const duration = computeDuration(state.equation, state.values);
      const positions: GhostRun['positions'] = [];
      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const t = (duration * i) / steps;
        positions.push({
          t,
          s: positionAt(state.values.u, state.values.a, t),
          v: velocityAt(state.values.u, state.values.a, t),
        });
      }
      const newGhost: GhostRun = {
        values: { ...state.values },
        positions,
        vehicle: state.vehicle,
        color: GHOST_COLORS[state.ghosts.length % GHOST_COLORS.length],
      };
      const ghosts = [...state.ghosts, newGhost].slice(-3); // keep last 3
      return { ...state, ghosts };
    }

    case 'CLEAR_GHOSTS':
      return { ...state, ghosts: [] };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(0.5, Math.min(2.5, action.zoom)) };

    case 'RECOMPUTE': {
      if (state.mode !== 'solver' || !state.unknown) {
        return { ...state, error: null, lastResult: null };
      }
      const result = solve(state.equation, state.unknown, state.values);
      if (result.ok && result.value !== undefined && Number.isFinite(result.value)) {
        return {
          ...state,
          values: { ...state.values, [state.unknown]: result.value },
          error: null,
          lastResult: { variable: state.unknown, value: result.value },
        };
      }
      if (!result.ok && result.error) {
        return { ...state, error: result.error, lastResult: null };
      }
      return { ...state, error: null, lastResult: null };
    }

    default:
      return state;
  }
}

export function useMotion() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const elapsedAccumRef = useRef<number>(0);

  // ─── Recompute on relevant state changes ─────────────────
  useEffect(() => {
    dispatch({ type: 'RECOMPUTE' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.mode,
    state.equation,
    state.variantIndex,
    state.unknown,
    state.values.u,
    state.values.v,
    state.values.a,
    state.values.s,
    state.values.t,
  ]);

  // ─── Animation loop ──────────────────────────────────────
  useEffect(() => {
    const isPlaying = state.playback.status === 'playing';
    const duration = computeDuration(state.equation, state.values);
    const durationMs = duration * 1000;
    const speed = state.playback.speed;

    if (!isPlaying) {
      lastTimestampRef.current = null;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    elapsedAccumRef.current = state.playback.elapsedMs;

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const dt = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;
      elapsedAccumRef.current += dt * speed;

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
      lastTimestampRef.current = null;
    };
  }, [state.playback.status, state.playback.speed, state.equation, state.values]);

  // ─── Action callbacks ────────────────────────────────────
  const setMode = useCallback(
    (mode: MotionState['mode']) => dispatch({ type: 'SET_MODE', mode }),
    []
  );
  const setEquation = useCallback(
    (equation: EquationKey) => dispatch({ type: 'SET_EQUATION', equation }),
    []
  );
  const setVariant = useCallback(
    (index: number) => dispatch({ type: 'SET_VARIANT', index }),
    []
  );
  const setValue = useCallback(
    (key: VariableKey, value: number) => dispatch({ type: 'SET_VALUE', key, value }),
    []
  );
  const setVehicle = useCallback(
    (vehicle: VehicleKey) => dispatch({ type: 'SET_VEHICLE', vehicle }),
    []
  );
  const toggleLayer = useCallback(
    (key: keyof LayerVisibility) => dispatch({ type: 'TOGGLE_LAYER', key }),
    []
  );
  const play = useCallback(() => dispatch({ type: 'PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const setSpeed = useCallback(
    (speed: PlaybackSpeed) => dispatch({ type: 'SET_SPEED', speed }),
    []
  );
  const saveGhost = useCallback(() => dispatch({ type: 'SAVE_GHOST' }), []);
  const clearGhosts = useCallback(() => dispatch({ type: 'CLEAR_GHOSTS' }), []);
  const setZoom = useCallback(
    (zoom: number) => dispatch({ type: 'SET_ZOOM', zoom }),
    [],
  );

  // ─── Derived values ──────────────────────────────────────
  const equationDef = EQUATIONS[state.equation];
  const variant = equationDef.variants[state.variantIndex] ?? equationDef.variants[0];
  const duration = computeDuration(state.equation, state.values);
  const liveTime = state.playback.elapsedMs / 1000;
  const liveS =
    state.equation === 'freefall'
      ? positionAt(0, G, liveTime)
      : positionAt(state.values.u, state.values.a, liveTime);
  const liveV =
    state.equation === 'freefall'
      ? velocityAt(0, G, liveTime)
      : velocityAt(state.values.u, state.values.a, liveTime);

  return {
    state,
    derived: { equationDef, variant, duration, liveTime, liveS, liveV },
    actions: {
      setMode,
      setEquation,
      setVariant,
      setValue,
      setVehicle,
      toggleLayer,
      play,
      pause,
      reset,
      setSpeed,
      saveGhost,
      clearGhosts,
      setZoom,
    },
  };
}

export type UseMotionReturn = ReturnType<typeof useMotion>;
