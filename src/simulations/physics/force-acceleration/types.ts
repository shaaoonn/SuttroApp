// ─────────────────────────────────────────────
// বল ও ত্বরণ Sim — Type definitions
// ─────────────────────────────────────────────

export type ScenarioKey =
  | 'cartPush'      // 🛒 cart pushed by N people, see F=ma
  | 'momentum'      // 🚂 train at velocity, p=mv
  | 'impulse'       // 🏏 bat hits ⚽ ball — F=Δp/Δt
  | 'weight'        // 🪐 planet selector, W=mg
  | 'forceTypes';   // overview / informational tab

export type Mode = 'solver' | 'explore';
export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';
export type DistanceUnit = 'm' | 'cm';

export type PlanetKey = 'moon' | 'mars' | 'earth' | 'jupiter';

export interface ForceVars {
  F: number;    // applied force (N)
  m: number;    // mass (kg)
  mu: number;   // friction coefficient
  u: number;    // initial velocity (m/s)
  v: number;    // final velocity (m/s)
  t: number;    // time interval (s)
  g: number;    // gravitational acceleration (m/s²)
  pushers: number; // number of figures pushing in cartPush (1-5)
}

export type VariableKey = keyof ForceVars;

export interface ValidationError {
  code: string;
  message: string;
}

export interface LayerVisibility {
  forceArrow: boolean;        // applied force arrow (orange)
  netForceArrow: boolean;     // net force after friction (red)
  velocityArrow: boolean;     // velocity arrow (green)
  accelArrow: boolean;        // acceleration arrow (purple)
  values: boolean;            // numerical labels next to arrows
  distanceMarkers: boolean;   // road position markers
  speedometer: boolean;       // floating speed gauge
}

export interface ForceState {
  mode: Mode;
  scenario: ScenarioKey;
  values: ForceVars;
  planet: PlanetKey;          // for weight scenario
  playback: { status: PlaybackStatus; elapsedMs: number };
  zoom: number;
  textScale: number;
  distanceUnit: DistanceUnit;
  layers: LayerVisibility;
  error: ValidationError | null;
}

export interface ScenarioPreset {
  label: string;
  question: string;
  values: Partial<ForceVars>;
  planet?: PlanetKey;
}
