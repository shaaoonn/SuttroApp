// ─────────────────────────────────────────────
// গতি Sim - Type definitions
// ─────────────────────────────────────────────

export type EquationKey = 'first' | 'second' | 'third' | 'fourth' | 'freefall';

export type VariableKey = 'u' | 'v' | 'a' | 's' | 't';

export type Mode = 'solver' | 'explore';

export type VehicleKey =
  | 'sedan'
  | 'motorcycle'
  | 'cng'
  | 'bicycle'
  | 'rocket'
  | 'ball';

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2;

/** Distance display unit — calculations always in meters; this is display-only. */
export type DistanceUnit = 'm' | 'cm';

export interface KinematicVars {
  u: number; // initial velocity (m/s)
  v: number; // final velocity (m/s)
  a: number; // acceleration (m/s²)
  s: number; // displacement (m)
  t: number; // time (s)
}

export interface FormulaVariant {
  /** Variable this variant solves for */
  solves: VariableKey;
  /** Display expression e.g., "v = u + at" */
  expression: string;
  /** Step-by-step derivation for "ধাপ-১, ধাপ-২, ধাপ-৩" */
  steps: string[];
  /** Required known variables (in addition to whatever's needed) */
  requires: VariableKey[];
}

export interface EquationDef {
  key: EquationKey;
  label: { bn: string; en: string };
  /** Base expression e.g., "v = u + at" */
  base: string;
  /** All algebraic rearrangements */
  variants: FormulaVariant[];
  /** Variables actively used by this equation */
  vars: VariableKey[];
}

export interface ValidationError {
  /** Error code */
  code: string;
  /** Friendly Bangla message shown to student */
  message: string;
}

export interface SolveResult {
  ok: boolean;
  value?: number;
  error?: ValidationError;
}

export interface GhostRun {
  /** Snapshot of values at the moment of capture */
  values: KinematicVars;
  /** Computed positions over time (for path drawing) */
  positions: { t: number; s: number; v: number }[];
  /** Vehicle that was used */
  vehicle: VehicleKey;
  /** Color tint for visual differentiation */
  color: string;
}

export interface LayerVisibility {
  velocityArrow: boolean;
  accelerationArrow: boolean;
  distanceMarkers: boolean;
  ghostTrail: boolean;
  vGraph: boolean;
  sGraph: boolean;
}

export interface MotionState {
  mode: Mode;
  equation: EquationKey;
  /** Index into variants[] of currently selected variant */
  variantIndex: number;
  /** The variable being solved (in solver mode) */
  unknown: VariableKey | null;
  values: KinematicVars;
  vehicle: VehicleKey;
  playback: {
    status: PlaybackStatus;
    /** Animation time, in real seconds (post speed multiplication) */
    elapsedMs: number;
    speed: PlaybackSpeed;
  };
  layers: LayerVisibility;
  ghosts: GhostRun[];
  error: ValidationError | null;
  /** Last computed result for ResultDisplay */
  lastResult: { variable: VariableKey; value: number } | null;
  /** Visual zoom — scales vehicle + readout text only, NOT road/sky/clouds */
  zoom: number;
  /** UI text-size scale — scales right-panel + embedded-slider sizes for projector use.
   *  Range 0.7 – 1.8 in 0.1 increments. Persists in localStorage. */
  textScale: number;
  /** Distance display unit — toggle between meters and centimeters */
  distanceUnit: DistanceUnit;
}

export interface MotionActions {
  setMode: (m: Mode) => void;
  setEquation: (e: EquationKey) => void;
  setVariant: (i: number) => void;
  setValue: (key: VariableKey, value: number) => void;
  setVehicle: (v: VehicleKey) => void;
  toggleLayer: (key: keyof LayerVisibility) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (s: PlaybackSpeed) => void;
  saveGhost: () => void;
  clearGhosts: () => void;
  /** Recompute solve / validate based on current state */
  recompute: () => void;
}
