// ─────────────────────────────────────────────
// জড়তা Sim — Pure physics logic
// All calculations + scenario presets from NCTB Class 9-10 Chapter 3
// ─────────────────────────────────────────────

import type {
  InertiaVars,
  ScenarioKey,
  ScenarioPreset,
  ValidationError,
} from './types';

export const G = 9.81;

// ─── Animation helpers ─────────────────────────────────────────

/** Position of vehicle at time t. s(t) = u·t + ½·a·t² */
export function vehiclePosAt(u: number, a: number, t: number): number {
  return u * t + 0.5 * a * t * t;
}

/** Velocity of vehicle at time t. v(t) = u + a·t (clamped at 0 if vehicle stops) */
export function vehicleVelAt(u: number, a: number, t: number): number {
  const v = u + a * t;
  // For brake scenarios where a < 0: vehicle stops at t = u/|a|, doesn't go negative
  if (a < 0 && u > 0 && v < 0) return 0;
  if (a > 0 && u < 0 && v > 0) return 0;
  return v;
}

/**
 * Compute passenger relative displacement from the bus inside.
 * When bus decelerates (a<0), passenger keeps moving forward at u (inertia)
 * while bus slows. Passenger relative to bus = u·t − vehiclePosAt(u, a, t)
 * but with friction limiting how far they can lurch:
 *   - Friction provides max deceleration f/m·g per second on passenger feet
 *   - If friction is enough to match bus deceleration, passenger doesn't lurch
 *   - Otherwise, passenger slides forward by (a + μg) × t² / 2 (relative)
 */
export function passengerLurch(
  busU: number,
  busA: number,
  mu: number,
  t: number
): number {
  // Only relevant during brake (busA < 0). For accelerate (busA > 0), passenger lurches back (negative).
  // Friction can decelerate passenger up to μ·g
  const maxFrictionDecel = mu * G;
  // Effective bus deceleration magnitude
  const busDecel = Math.abs(busA);
  // Net relative acceleration of passenger w.r.t. bus
  // If friction is sufficient, no lurch
  if (maxFrictionDecel >= busDecel) return 0;
  // Otherwise passenger lurches — direction opposite to bus accel
  const dir = busA < 0 ? 1 : -1; // brake → forward, accelerate → backward
  const netAccel = (busDecel - maxFrictionDecel) * dir;
  return 0.5 * netAccel * t * t;
}

/** Time when bus stops (only meaningful for brake scenarios) */
export function stoppingTime(u: number, a: number): number {
  if (a >= 0 || u <= 0) return Infinity;
  return u / Math.abs(a);
}

/** Distance bus travels before stopping */
export function stoppingDistance(u: number, a: number): number {
  if (a >= 0) return Infinity;
  return (u * u) / (2 * Math.abs(a));
}

// ─── Validation ──────────────────────────────────────────────

const ERR_NEG_FRICTION: ValidationError = {
  code: 'neg_friction',
  message: 'ঘর্ষণাঙ্ক ০ থেকে ১-এর মধ্যে হতে হবে',
};

export function validate(vars: InertiaVars): ValidationError | null {
  if (vars.mu < 0 || vars.mu > 1) return ERR_NEG_FRICTION;
  return null;
}

// ─── Duration computation per scenario ───────────────────────

export function computeDuration(scenario: ScenarioKey, vars: InertiaVars): number {
  const clamp = (x: number) => Math.max(0.5, Math.min(15, x));
  switch (scenario) {
    case 'busBrake': {
      // Brake until bus stops
      const tStop = stoppingTime(vars.u, vars.a);
      if (Number.isFinite(tStop)) return clamp(tStop + 0.5);
      return clamp(vars.t || 5);
    }
    case 'busStart': {
      // Accelerate for given t
      return clamp(vars.t || 4);
    }
    case 'tablecloth': {
      // Quick action — short
      return clamp(vars.t || 1.5);
    }
    case 'spaceObject': {
      // Constant velocity for visual effect
      return clamp(vars.t || 6);
    }
  }
}

// ─── Scenario presets — NCTB textbook + SSC exam classics ───

export const SCENARIO_PRESETS: Record<ScenarioKey, ScenarioPreset[]> = {
  busBrake: [
    {
      label: 'বই-উদাহরণ ১: শহরের বাস',
      question: '৬০ km/h গতিতে চলন্ত একটি বাস হঠাৎ ব্রেক চাপলে ৭০ kg যাত্রী কেন সামনে ঝুঁকে পড়ে?',
      values: { m: 70, u: 16.7 /* 60km/h */, a: -10, mu: 0.3, t: 2 },
    },
    {
      label: 'বই-উদাহরণ ২: হালকা যাত্রী',
      question: 'হালকা ১০ kg শিশু ৭০ kg প্রাপ্তবয়স্কের চেয়ে বেশি ঝুঁকে কেন? (জড়তা ∝ ভর)',
      values: { m: 10, u: 16.7, a: -10, mu: 0.3, t: 2 },
    },
    {
      label: 'মৃদু ব্রেক',
      question: 'কম মন্দনে (২ m/s²) যাত্রী কেন ঝুঁকে না?',
      values: { m: 70, u: 16.7, a: -2, mu: 0.3, t: 5 },
    },
  ],
  busStart: [
    {
      label: 'বই-উদাহরণ: স্থির বাস',
      question: 'স্থির বাস হঠাৎ চালু হলে যাত্রী পেছনে কেন ঝুঁকে পড়ে? (স্থিতি জড়তা)',
      values: { m: 70, u: 0, a: 4, mu: 0.3, t: 3 },
    },
    {
      label: 'হালকা ত্বরণ',
      question: 'মৃদু ত্বরণে (১ m/s²) যাত্রী কেন ঝুঁকে না?',
      values: { m: 70, u: 0, a: 1, mu: 0.3, t: 4 },
    },
  ],
  tablecloth: [
    {
      label: 'দ্রুত টান (trick কাজ করে)',
      question: 'কাঁচের গ্লাসের নিচ থেকে কাপড় দ্রুত টানলে গ্লাস কেন থেকে যায়?',
      values: { m: 0.3, u: 5, a: 0, mu: 0.15, t: 0.3 },
    },
    {
      label: 'ধীর টান (cup-ও যায়)',
      question: 'ধীরে টানলে গ্লাস কেন কাপড়ের সাথে যায়?',
      values: { m: 0.3, u: 0.5, a: 0, mu: 0.15, t: 1.5 },
    },
  ],
  spaceObject: [
    {
      label: 'কোনো বল নাই → constant বেগ',
      question: 'মহাশূন্যে F_net = 0 হলে বস্তু কেন একই বেগে চলতে থাকে?',
      values: { m: 5, u: 8, a: 0, mu: 0, t: 6 },
    },
  ],
};

// ─── Scenario metadata for UI ──────────────────────────────

export const SCENARIOS: Record<
  ScenarioKey,
  { label: string; emoji: string; description: string }
> = {
  busBrake: {
    label: 'চলন্ত বাস ব্রেক',
    emoji: '🚌',
    description: 'গতি জড়তা — হঠাৎ ব্রেক করলে যাত্রী সামনে ঝুঁকে',
  },
  busStart: {
    label: 'স্থির বাস চালু',
    emoji: '🚍',
    description: 'স্থিতি জড়তা — চালু হলে যাত্রী পেছনে ঝুঁকে',
  },
  tablecloth: {
    label: 'টেবিল-ক্লথ ট্রিক',
    emoji: '🍽️',
    description: 'দ্রুত টানলে গ্লাস থাকে — পাঠ্যবই demonstration',
  },
  spaceObject: {
    label: 'মুক্ত বস্তু (no force)',
    emoji: '🛰️',
    description: 'F_net = 0 → constant velocity (১ম সূত্র)',
  },
};

/** Default values per scenario */
export function defaultVarsFor(scenario: ScenarioKey): InertiaVars {
  return SCENARIO_PRESETS[scenario][0].values as InertiaVars;
}
