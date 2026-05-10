// ─────────────────────────────────────────────
// বল ও ত্বরণ Sim — Pure physics logic
// ─────────────────────────────────────────────

import type {
  ForceVars,
  PlanetKey,
  ScenarioKey,
  ScenarioPreset,
  ValidationError,
} from './types';

// ─── Planet gravity values (m/s²) ──────────────

export const PLANET_GRAVITY: Record<PlanetKey, number> = {
  moon: 1.62,
  mars: 3.71,
  earth: 9.81,
  jupiter: 24.79,
};

export const PLANET_NAMES: Record<PlanetKey, { bn: string; emoji: string }> = {
  moon: { bn: 'চাঁদ', emoji: '🌙' },
  mars: { bn: 'মঙ্গল', emoji: '🔴' },
  earth: { bn: 'পৃথিবী', emoji: '🌍' },
  jupiter: { bn: 'বৃহস্পতি', emoji: '🪐' },
};

// ─── Core formulas (pure functions) ──────────────

/** Newton's 2nd law: a = F_net / m, where F_net = F_applied − μmg */
export function netForce(F: number, m: number, mu: number, g = 9.81): number {
  // Friction opposes motion direction. Simplified: f = μmg in magnitude.
  // We assume motion direction = sign(F) for static case.
  const friction = mu * m * g;
  if (Math.abs(F) <= friction && /* not yet moving */ true) {
    // If applied force less than max static friction, net = 0 (textbook simplification)
    return 0;
  }
  return F - Math.sign(F) * friction;
}

/** Acceleration from F=ma */
export function accelerationFrom(F: number, m: number, mu: number, g = 9.81): number {
  if (m <= 0) return 0;
  return netForce(F, m, mu, g) / m;
}

/** Momentum p = mv */
export function momentum(m: number, v: number): number {
  return m * v;
}

/** Force from impulse: F = (mv - mu) / t */
export function forceFromImpulse(m: number, u: number, v: number, t: number): number {
  if (t <= 0) return 0;
  return (m * v - m * u) / t;
}

/** Impulse: J = mv − mu = Ft */
export function impulse(m: number, u: number, v: number): number {
  return m * (v - u);
}

/** Weight: W = mg */
export function weight(m: number, g: number): number {
  return m * g;
}

/** Animation position from F applied for time t (simple kinematics) */
export function positionAt(u: number, a: number, t: number): number {
  return u * t + 0.5 * a * t * t;
}

/** Velocity at time t */
export function velocityAt(u: number, a: number, t: number): number {
  return u + a * t;
}

// ─── Validation ─────────────────────────────

export function validate(vars: ForceVars): ValidationError | null {
  if (vars.m <= 0) {
    return { code: 'mass_zero', message: 'ভর শূন্য বা ঋণাত্মক হতে পারে না' };
  }
  if (vars.t <= 0) {
    return { code: 'time_zero', message: 'সময় শূন্য বা ঋণাত্মক হতে পারে না' };
  }
  return null;
}

// ─── Animation duration per scenario ─────────

export function computeDuration(scenario: ScenarioKey, vars: ForceVars): number {
  const clamp = (x: number) => Math.max(0.5, Math.min(15, x));
  switch (scenario) {
    case 'cartPush': {
      // Run animation for ~5s of motion, or until cart hits screen edge
      return clamp(5);
    }
    case 'momentum': {
      // Train moves at constant velocity for visual demo
      return clamp(6);
    }
    case 'impulse': {
      // Very short interaction — extend animation by 1s padding to see before/after
      return clamp(vars.t * 4 + 1);
    }
    case 'weight':
    case 'forceTypes':
      return 5;
  }
}

// ─── Scenario presets — NCTB textbook + SSC exam classics ───

export const SCENARIO_PRESETS: Record<ScenarioKey, ScenarioPreset[]> = {
  cartPush: [
    {
      label: 'বই উদাহরণ ১: হালকা গাড়ি',
      question: '১০ kg ভরের গাড়িতে ২০ N বল প্রয়োগ করলে ত্বরণ কত?',
      values: { F: 20, m: 10, mu: 0, u: 0, t: 5, pushers: 1 },
    },
    {
      label: 'বই উদাহরণ ২: ভারী বস্তু',
      question: '১০০ N বলে ৫০ kg বস্তুর ত্বরণ কত হবে? (μ=০)',
      values: { F: 100, m: 50, mu: 0, u: 0, t: 5, pushers: 2 },
    },
    {
      label: 'ঘর্ষণসহ',
      question: '২০০ N বল প্রয়োগ করা ১০০ kg বস্তু (μ=০.২) — net force + acceleration?',
      values: { F: 200, m: 100, mu: 0.2, u: 0, t: 5, pushers: 3 },
    },
    {
      label: 'বল সমান, ভর ভিন্ন',
      question: '১০০ N বলে ১০ kg vs ১০০ kg — কোনটার ত্বরণ বেশি? (a ∝ ১/m)',
      values: { F: 100, m: 10, mu: 0, u: 0, t: 5, pushers: 1 },
    },
  ],
  momentum: [
    {
      label: 'ট্রেন (high mass, moderate v)',
      question: '১০০০ kg ট্রেন ১৫ m/s বেগে চললে ভরবেগ কত?',
      values: { F: 0, m: 1000, mu: 0, u: 15, v: 15, t: 1, pushers: 0 },
    },
    {
      label: 'বুলেট (low mass, high v)',
      question: '০.০৫ kg বুলেট ৪০০ m/s — ভরবেগ?',
      values: { F: 0, m: 0.05, mu: 0, u: 400, v: 400, t: 1, pushers: 0 },
    },
    {
      label: 'গাড়ি',
      question: '১০০০ kg গাড়ি ২৫ m/s — ভরবেগ?',
      values: { F: 0, m: 1000, mu: 0, u: 25, v: 25, t: 1, pushers: 0 },
    },
  ],
  impulse: [
    {
      label: 'ক্রিকেট bat-এ ball',
      question: '০.১৫ kg ক্রিকেট ball (৩০ m/s) bat-এ লাগে এবং -৫০ m/s বেগে ফিরে যায় ০.০২ s-এ — কত বল?',
      values: { F: 0, m: 0.15, mu: 0, u: 30, v: -50, t: 0.02, pushers: 0 },
    },
    {
      label: 'গাড়ি crash',
      question: '১০০০ kg গাড়ি ২০ m/s থেকে ০ m/s — দেয়ালে ০.১ s-এ। বল?',
      values: { F: 0, m: 1000, mu: 0, u: 20, v: 0, t: 0.1, pushers: 0 },
    },
    {
      label: 'বল লাথি দেওয়া',
      question: '০.৪ kg ফুটবল ০ থেকে ২৫ m/s ০.০৫ s-এ — পায়ের বল?',
      values: { F: 0, m: 0.4, mu: 0, u: 0, v: 25, t: 0.05, pushers: 0 },
    },
  ],
  weight: [
    {
      label: 'পৃথিবীতে',
      question: '৭০ kg ব্যক্তির পৃথিবীতে ওজন কত?',
      values: { F: 0, m: 70, mu: 0, u: 0, v: 0, t: 1, g: 9.81, pushers: 0 },
      planet: 'earth',
    },
    {
      label: 'চাঁদে',
      question: '৭০ kg ব্যক্তির চাঁদে ওজন কত? (g = 1.62 m/s²)',
      values: { F: 0, m: 70, mu: 0, u: 0, v: 0, t: 1, g: 1.62, pushers: 0 },
      planet: 'moon',
    },
    {
      label: 'মঙ্গলে',
      question: '৭০ kg-এর মঙ্গলে ওজন? (g = 3.71 m/s²)',
      values: { F: 0, m: 70, mu: 0, u: 0, v: 0, t: 1, g: 3.71, pushers: 0 },
      planet: 'mars',
    },
    {
      label: 'বৃহস্পতিতে',
      question: 'বৃহস্পতিতে ৭০ kg — ওজন? (g = 24.79 m/s²)',
      values: { F: 0, m: 70, mu: 0, u: 0, v: 0, t: 1, g: 24.79, pushers: 0 },
      planet: 'jupiter',
    },
  ],
  forceTypes: [],
};

export const SCENARIOS: Record<
  ScenarioKey,
  { label: string; emoji: string; description: string }
> = {
  cartPush: {
    label: 'F = ma',
    emoji: '🛒',
    description: 'নিউটনের ২য় সূত্র — বল, ভর, ত্বরণ',
  },
  momentum: {
    label: 'ভরবেগ',
    emoji: '🚂',
    description: 'p = mv — ভর × বেগ',
  },
  impulse: {
    label: 'আবেগ',
    emoji: '🏏',
    description: 'F = Δp/Δt — অল্প সময়ে বড় বল',
  },
  weight: {
    label: 'ওজন',
    emoji: '🪐',
    description: 'W = mg — গ্রহভেদে g আলাদা',
  },
  forceTypes: {
    label: 'বলের প্রকার',
    emoji: '📚',
    description: 'স্পর্শ/অস্পর্শ, সাম্য/অসাম্য, ৪টি মৌলিক',
  },
};

export function defaultVarsFor(scenario: ScenarioKey): ForceVars {
  const presets = SCENARIO_PRESETS[scenario];
  if (presets.length > 0) return presets[0].values as ForceVars;
  // Fallback for forceTypes
  return {
    F: 100,
    m: 50,
    mu: 0.2,
    u: 0,
    v: 0,
    t: 1,
    g: 9.81,
    pushers: 1,
  };
}

export function defaultPlanetFor(scenario: ScenarioKey): PlanetKey {
  if (scenario === 'weight') return 'earth';
  return 'earth';
}
