// ─────────────────────────────────────────────
// গতি Sim - PURE physics logic (no React)
// All 4 NCTB kinematic equations + variants + free fall
// Fully unit-testable
// ─────────────────────────────────────────────

import type {
  EquationDef,
  EquationKey,
  KinematicVars,
  SolveResult,
  ValidationError,
  VariableKey,
} from './types';

export const G = 9.81; // m/s² — gravity for free fall

// ─── Equation definitions with all algebraic variants ──────────

export const EQUATIONS: Record<EquationKey, EquationDef> = {
  // ১ম সূত্র: v = u + at
  first: {
    key: 'first',
    label: { bn: 'গতির ১ম সূত্র', en: 'First equation' },
    base: 'v = u + at',
    vars: ['u', 'v', 'a', 't'],
    variants: [
      {
        solves: 'v',
        expression: 'v = u + at',
        steps: ['দেওয়া আছে: v = u + at'],
        requires: ['u', 'a', 't'],
      },
      {
        solves: 'u',
        expression: 'u = v − at',
        steps: ['দেওয়া আছে: v = u + at', 'ধাপ-১: u = v − at'],
        requires: ['v', 'a', 't'],
      },
      {
        solves: 'a',
        expression: 'a = (v − u) / t',
        steps: [
          'দেওয়া আছে: v = u + at',
          'ধাপ-১: v − u = at',
          'ধাপ-২: a = (v − u) / t',
        ],
        requires: ['u', 'v', 't'],
      },
      {
        solves: 't',
        expression: 't = (v − u) / a',
        steps: [
          'দেওয়া আছে: v = u + at',
          'ধাপ-১: v − u = at',
          'ধাপ-২: t = (v − u) / a',
        ],
        requires: ['u', 'v', 'a'],
      },
    ],
  },

  // ২য় সূত্র: s = ut + ½at²
  second: {
    key: 'second',
    label: { bn: 'গতির ২য় সূত্র', en: 'Second equation' },
    base: 's = ut + ½at²',
    vars: ['u', 'a', 's', 't'],
    variants: [
      {
        solves: 's',
        expression: 's = ut + ½at²',
        steps: ['দেওয়া আছে: s = ut + ½at²'],
        requires: ['u', 'a', 't'],
      },
      {
        solves: 'u',
        expression: 'u = (s − ½at²) / t',
        steps: [
          'দেওয়া আছে: s = ut + ½at²',
          'ধাপ-১: ut = s − ½at²',
          'ধাপ-২: u = (s − ½at²) / t',
        ],
        requires: ['s', 'a', 't'],
      },
      {
        solves: 'a',
        expression: 'a = 2(s − ut) / t²',
        steps: [
          'দেওয়া আছে: s = ut + ½at²',
          'ধাপ-১: ½at² = s − ut',
          'ধাপ-২: a = 2(s − ut) / t²',
        ],
        requires: ['s', 'u', 't'],
      },
    ],
  },

  // ৩য় সূত্র: v² = u² + 2as
  third: {
    key: 'third',
    label: { bn: 'গতির ৩য় সূত্র', en: 'Third equation' },
    base: 'v² = u² + 2as',
    vars: ['u', 'v', 'a', 's'],
    variants: [
      {
        solves: 'v',
        expression: 'v = √(u² + 2as)',
        steps: ['দেওয়া আছে: v² = u² + 2as', 'ধাপ-১: v = √(u² + 2as)'],
        requires: ['u', 'a', 's'],
      },
      {
        solves: 'u',
        expression: 'u = √(v² − 2as)',
        steps: ['দেওয়া আছে: v² = u² + 2as', 'ধাপ-১: u² = v² − 2as', 'ধাপ-২: u = √(v² − 2as)'],
        requires: ['v', 'a', 's'],
      },
      {
        solves: 'a',
        expression: 'a = (v² − u²) / 2s',
        steps: [
          'দেওয়া আছে: v² = u² + 2as',
          'ধাপ-১: 2as = v² − u²',
          'ধাপ-২: a = (v² − u²) / 2s',
        ],
        requires: ['u', 'v', 's'],
      },
      {
        solves: 's',
        expression: 's = (v² − u²) / 2a',
        steps: [
          'দেওয়া আছে: v² = u² + 2as',
          'ধাপ-১: 2as = v² − u²',
          'ধাপ-২: s = (v² − u²) / 2a',
        ],
        requires: ['u', 'v', 'a'],
      },
    ],
  },

  // গড়বেগ সূত্র: s = (u+v)t / 2
  fourth: {
    key: 'fourth',
    label: { bn: 'গড়বেগ সূত্র', en: 'Average velocity' },
    base: 's = (u + v)t / 2',
    vars: ['u', 'v', 's', 't'],
    variants: [
      {
        solves: 's',
        expression: 's = (u + v)t / 2',
        steps: ['দেওয়া আছে: s = (u + v)t / 2'],
        requires: ['u', 'v', 't'],
      },
      {
        solves: 'u',
        expression: 'u = 2s/t − v',
        steps: [
          'দেওয়া আছে: s = (u + v)t / 2',
          'ধাপ-১: 2s = (u + v)t',
          'ধাপ-২: u = 2s/t − v',
        ],
        requires: ['s', 'v', 't'],
      },
      {
        solves: 'v',
        expression: 'v = 2s/t − u',
        steps: [
          'দেওয়া আছে: s = (u + v)t / 2',
          'ধাপ-১: 2s = (u + v)t',
          'ধাপ-২: v = 2s/t − u',
        ],
        requires: ['s', 'u', 't'],
      },
      {
        solves: 't',
        expression: 't = 2s / (u + v)',
        steps: [
          'দেওয়া আছে: s = (u + v)t / 2',
          'ধাপ-১: (u + v)t = 2s',
          'ধাপ-২: t = 2s / (u + v)',
        ],
        requires: ['s', 'u', 'v'],
      },
    ],
  },

  // মুক্ত পতন: a = g, u = 0 by default
  freefall: {
    key: 'freefall',
    label: { bn: 'মুক্ত পতন', en: 'Free fall' },
    base: 'h = ½gt²,  v = gt',
    vars: ['v', 's', 't'],
    variants: [
      {
        solves: 's',
        expression: 'h = ½gt²',
        steps: [
          'দেওয়া আছে: u = 0, a = g = 9.81 m/s²',
          'গতির ২য় সূত্র: s = ut + ½at²',
          'ধাপ-১: h = ½ × 9.81 × t²',
        ],
        requires: ['t'],
      },
      {
        solves: 'v',
        expression: 'v = gt',
        steps: [
          'দেওয়া আছে: u = 0, a = g = 9.81 m/s²',
          'গতির ১ম সূত্র: v = u + at',
          'ধাপ-১: v = 9.81 × t',
        ],
        requires: ['t'],
      },
      {
        solves: 't',
        expression: 't = √(2h/g)',
        steps: [
          'দেওয়া আছে: u = 0, a = g',
          'h = ½gt²',
          'ধাপ-১: t² = 2h/g',
          'ধাপ-২: t = √(2h/g)',
        ],
        requires: ['s'],
      },
    ],
  },
};

// ─── Solver functions ──────────────────────────────────────────

const ERR_DIV_ZERO: ValidationError = {
  code: 'div_zero',
  message: 'শূন্য দিয়ে ভাগ করা যায় না — অন্য মান চেষ্টা করো',
};

const ERR_NEGATIVE_SQRT: ValidationError = {
  code: 'neg_sqrt',
  message: 'এই combination-এ ফলাফল কাল্পনিক হয়ে যাচ্ছে — মান বদলাও',
};

const ERR_NEGATIVE_TIME: ValidationError = {
  code: 'neg_time',
  message: 'নেগেটিভ সময় সম্ভব না — অন্য মান চেষ্টা করো',
};

const isClose = (x: number, y: number, eps = 1e-9) => Math.abs(x - y) < eps;

/**
 * Compute the unknown variable based on equation + variant.
 * Returns either the value or a validation error.
 */
export function solve(
  equation: EquationKey,
  unknown: VariableKey,
  vars: KinematicVars
): SolveResult {
  const { u, v, a, s, t } = vars;

  try {
    switch (equation) {
      case 'first':
        if (unknown === 'v') return { ok: true, value: u + a * t };
        if (unknown === 'u') return { ok: true, value: v - a * t };
        if (unknown === 'a') {
          if (isClose(t, 0)) return { ok: false, error: ERR_DIV_ZERO };
          return { ok: true, value: (v - u) / t };
        }
        if (unknown === 't') {
          if (isClose(a, 0)) return { ok: false, error: ERR_DIV_ZERO };
          const result = (v - u) / a;
          if (result < 0) return { ok: false, error: ERR_NEGATIVE_TIME };
          return { ok: true, value: result };
        }
        break;

      case 'second':
        if (unknown === 's') return { ok: true, value: u * t + 0.5 * a * t * t };
        if (unknown === 'u') {
          if (isClose(t, 0)) return { ok: false, error: ERR_DIV_ZERO };
          return { ok: true, value: (s - 0.5 * a * t * t) / t };
        }
        if (unknown === 'a') {
          if (isClose(t, 0)) return { ok: false, error: ERR_DIV_ZERO };
          return { ok: true, value: (2 * (s - u * t)) / (t * t) };
        }
        // 't' for second equation is quadratic; show error suggesting another variant
        if (unknown === 't') {
          return {
            ok: false,
            error: {
              code: 'use_other_variant',
              message: '২য় সূত্রে t solve করতে অন্য সূত্র (১ম বা ৪র্থ) ব্যবহার করো',
            },
          };
        }
        break;

      case 'third':
        if (unknown === 'v') {
          const inside = u * u + 2 * a * s;
          if (inside < 0) return { ok: false, error: ERR_NEGATIVE_SQRT };
          return { ok: true, value: Math.sqrt(inside) };
        }
        if (unknown === 'u') {
          const inside = v * v - 2 * a * s;
          if (inside < 0) return { ok: false, error: ERR_NEGATIVE_SQRT };
          return { ok: true, value: Math.sqrt(inside) };
        }
        if (unknown === 'a') {
          if (isClose(s, 0)) return { ok: false, error: ERR_DIV_ZERO };
          return { ok: true, value: (v * v - u * u) / (2 * s) };
        }
        if (unknown === 's') {
          if (isClose(a, 0)) return { ok: false, error: ERR_DIV_ZERO };
          return { ok: true, value: (v * v - u * u) / (2 * a) };
        }
        break;

      case 'fourth':
        if (unknown === 's') return { ok: true, value: ((u + v) * t) / 2 };
        if (unknown === 'u') {
          if (isClose(t, 0)) return { ok: false, error: ERR_DIV_ZERO };
          return { ok: true, value: (2 * s) / t - v };
        }
        if (unknown === 'v') {
          if (isClose(t, 0)) return { ok: false, error: ERR_DIV_ZERO };
          return { ok: true, value: (2 * s) / t - u };
        }
        if (unknown === 't') {
          if (isClose(u + v, 0)) return { ok: false, error: ERR_DIV_ZERO };
          const result = (2 * s) / (u + v);
          if (result < 0) return { ok: false, error: ERR_NEGATIVE_TIME };
          return { ok: true, value: result };
        }
        break;

      case 'freefall':
        // Free fall: u = 0, a = g, s = h (downward positive)
        if (unknown === 's') return { ok: true, value: 0.5 * G * t * t };
        if (unknown === 'v') return { ok: true, value: G * t };
        if (unknown === 't') {
          if (s < 0) return { ok: false, error: ERR_NEGATIVE_SQRT };
          return { ok: true, value: Math.sqrt((2 * s) / G) };
        }
        break;
    }

    return {
      ok: false,
      error: { code: 'unsupported', message: 'এই variable solve করা যাচ্ছে না' },
    };
  } catch {
    return {
      ok: false,
      error: { code: 'compute', message: 'গণনায় সমস্যা হয়েছে — মান যাচাই করো' },
    };
  }
}

// ─── Animation/integration helpers ─────────────────────────────

/** Position at time t (for animation playback). s(t) = ut + ½at² */
export function positionAt(u: number, a: number, t: number): number {
  return u * t + 0.5 * a * t * t;
}

/** Velocity at time t. v(t) = u + at */
export function velocityAt(u: number, a: number, t: number): number {
  return u + a * t;
}

/**
 * Compute total animation duration based on solved t,
 * clamped to a reasonable range.
 */
export function computeDuration(
  equation: EquationKey,
  vars: KinematicVars
): number {
  const t = vars.t;
  if (equation === 'freefall') {
    // For freefall, derive from height if available
    if (vars.s > 0) return Math.sqrt((2 * vars.s) / G);
    return Math.max(0.5, Math.min(20, t || 5));
  }
  // Cap between 0.5s and 30s for sane animation
  return Math.max(0.5, Math.min(30, t || 5));
}

/** Sample positions/velocities over duration for graph + ghost trails */
export function sampleTrajectory(
  u: number,
  a: number,
  duration: number,
  steps = 60
): { t: number; s: number; v: number }[] {
  const out: { t: number; s: number; v: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (duration * i) / steps;
    out.push({
      t,
      s: positionAt(u, a, t),
      v: velocityAt(u, a, t),
    });
  }
  return out;
}

// ─── Defaults per equation ─────────────────────────────────────

/** Get sensible default values per equation (used when switching tabs) */
export function defaultVarsFor(equation: EquationKey): KinematicVars {
  switch (equation) {
    case 'first':
      return { u: 5, v: 25, a: 2, s: 0, t: 10 };
    case 'second':
      return { u: 5, v: 0, a: 2, s: 150, t: 10 };
    case 'third':
      return { u: 5, v: 25, a: 1.5, s: 100, t: 0 };
    case 'fourth':
      return { u: 5, v: 25, a: 0, s: 150, t: 10 };
    case 'freefall':
      return { u: 0, v: 0, a: G, s: 50, t: 0 };
  }
}

/** Get the default unknown variable per equation */
export function defaultUnknownFor(equation: EquationKey): VariableKey {
  switch (equation) {
    case 'first':
      return 'v';
    case 'second':
      return 's';
    case 'third':
      return 'v';
    case 'fourth':
      return 's';
    case 'freefall':
      return 's';
  }
}
