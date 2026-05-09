// ─────────────────────────────────────────────
// জড়তা Sim — Type definitions
// ─────────────────────────────────────────────

export type ScenarioKey =
  | 'busBrake'         // চলন্ত বাস হঠাৎ ব্রেক → যাত্রী সামনে ঝুঁকে (গতি জড়তা)
  | 'busStart'         // স্থির বাস চালু → যাত্রী পেছনে ঝুঁকে (স্থিতি জড়তা)
  | 'tablecloth'       // কাঁচের গ্লাস + tablecloth flick (textbook demonstration)
  | 'spaceObject';     // F_net = 0, constant velocity (concept anchor)

export type Mode = 'solver' | 'explore';

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'finished';

export interface InertiaVars {
  m: number;       // mass of passenger / cup / object
  u: number;       // initial velocity (m/s)
  a: number;       // acceleration / deceleration (m/s²)
  mu: number;      // friction coefficient
  t: number;       // time (s)
}

export type VariableKey = keyof InertiaVars;

export interface ValidationError {
  code: string;
  message: string;
}

export interface LayerVisibility {
  velocityArrow: boolean;
  forceArrow: boolean;
  distanceMarkers: boolean;
  inertiaIndicator: boolean; // shows lurch direction text "যাত্রী সামনে ঝুঁকে"
}

export interface InertiaState {
  mode: Mode;
  scenario: ScenarioKey;
  values: InertiaVars;
  playback: {
    status: PlaybackStatus;
    elapsedMs: number;
  };
  zoom: number;
  layers: LayerVisibility;
  error: ValidationError | null;
}

export interface InertiaActions {
  setMode: (m: Mode) => void;
  setScenario: (s: ScenarioKey) => void;
  setValue: (key: VariableKey, value: number) => void;
  toggleLayer: (key: keyof LayerVisibility) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setZoom: (z: number) => void;
}

/** Preset textbook examples — buttons that pre-fill sliders */
export interface ScenarioPreset {
  label: string;        // Bangla button label
  values: Partial<InertiaVars>;
  /** Question text shown when preset is loaded */
  question: string;
}
