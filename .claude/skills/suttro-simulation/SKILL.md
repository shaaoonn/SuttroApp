---
name: suttro-simulation
description: Build a new interactive simulation for সূত্র (suttro.app) following the established architecture, brand, and admin-panel conventions. Use this whenever the user asks to create a new sim ("একটা নতুন সিমুলেশন করো", "Add Newton's Laws sim", "Light reflection sim তৈরি করো", "Create a chemistry sim", or anything that adds to the Chapter X coverage). Covers the full lifecycle: research, design discussion, code scaffold, custom Canvas drawing, DB seed, admin entry, build verification, commit, push, deploy. Brand: cartoon-leaning modern illustration with NCTB chapter alignment + Bangla-first UX. Reference benchmarks: PhET interaction quality + Master Sab pedagogy (formula solver + step-by-step derivation), beat both with mobile-first.
---

# সূত্র Simulation Creation Skill

This is the playbook for adding a new interactive simulation to suttro.app. **Always follow it from top to bottom.** Skipping research or DB seeding produces inferior, inconsistent sims.

> The flagship sim is **গতি / Motion** at `src/simulations/physics/motion/`. Use it as the gold-standard reference for code structure, visuals, and interaction patterns.

## CRITICAL RULES

### 1. The user has full autonomy permission
Don't ask for approval on routine choices (file paths, color picks, slider ranges). Decide → build → ship. Only ask when there's a genuine ambiguity (e.g., "should sim cover Chapter X or Y?", "Bengali wording — formal NCTB or student-friendly?").

### 2. Every new sim MUST have a DB row + be public by default
After code is done, INSERT a fully-populated row into `simulations` table with `status='public'`. The user only edits if they want changes. Never leave the row blank for them to fill — fill it yourself with NCTB chapter name as title, your best description, etc.

### 3. Brand: realistic-feel via system emojis + DAY theme
**Hard-learned from Motion sim iteration (4+ rounds of feedback):**
- ✅ **System emojis** for vehicles/objects (🚗 🏍️ 🛺 🚲 🚀 ⚽) — render as
  photorealistic via Apple/Google/MS emoji fonts. Free, scalable, consistent.
  Sized at ~120-130px for visibility (1.3× the default 90px).
- ✅ **Day theme**: blue sky gradient + sun with glow + 3-4 fluffy clouds +
  distant green hills with parallax + grass strips. NOT night/dark.
- ✅ Subtle gradients, soft shadows, rounded pill controls, frosted-glass overlays
- ✅ Bangla cultural objects when relevant (CNG, রিকশা, motorcycle, ক্রিকেট ball)
- ✅ Mobile-first responsive — `window.innerWidth < 700` triggers compact mode
- ✅ Bangla throughout — Hind Siliguri font handled by global CSS
- ❌ NO night/dark canvas (rejected by user — "আমরা চাচ্ছি দিনের মত")
- ❌ NO custom Canvas-drawn vehicles from primitives (rejected — "গাড়িগুলো রিয়েল হয়নি")
- ❌ NO stock 3D rendered images / Master Sab-style stiff renders
- ❌ NO kindergarten cartoon
- ❌ NO photo-realistic 3D (impossible to maintain)

### 4. Day-theme color palette (canvas)
```
/* Sky (gradient top to horizon) */
--sky-top:        #7CC2F0  /* bright sky blue */
--sky-mid:        #B5DCEC  /* softer */
--sky-horizon:    #E1F0F8  /* pale at horizon */

/* Sun */
--sun:            #FFD86E
--sun-inner:      #FFEEA0
--sun-glow:       rgba(255, 230, 150, 0.55)

/* Cloud */
--cloud-fill:     rgba(255, 255, 255, 0.95)
--cloud-highlight: rgba(255, 255, 255, 0.6)

/* Hills (parallax) */
--hill-far:       rgba(120, 165, 140, 0.45)
--hill-near:      rgba(95, 145, 120, 0.55)

/* Grass */
--grass-top:      #7BB661
--grass-bottom:   #5A9A4A → #477A3D

/* Road */
--road-grad:      #3E444E → #30353E → #3E444E
--road-shoulder:  #FFC93C  /* yellow stripes top + bottom */
--road-dashes:    #FFFFFF  /* white dashed center, 5px wide, [34, 22] dash */

/* Vectors / labels */
--velocity:       #16A34A  /* green pill with white text */
--accel:          #EA580C  /* orange pill with white text */
--origin:         #16A34A  /* "শুরু" marker */

/* UI overlays */
--overlay-bg:     rgba(255, 255, 255, 0.88)  /* frosted-glass pill */
--overlay-border: rgba(255, 255, 255, 0.7)
--overlay-shadow: 0 6px 20px rgba(0, 0, 0, 0.18)

/* Floating readout (above vehicle) */
--readout-bg:     rgba(11, 29, 58, 0.92)
--readout-text:   #FFFFFF
```
Outside the sim canvas (sim/[slug] page wrapper), use `var(--suttro-*)` light theme tokens (warm gradient FFF8E7 → DBEAFE → F0F9FF).

---

## CRITICAL VISUAL + UX PATTERNS (gold standard from Motion sim)

These are non-negotiable patterns hammered out over multiple feedback iterations.
Replicate exactly when creating a new sim. Deviation produces uglier UX.

### A. Camera-follow vehicle (Subway Surfers / PhET style)
**The vehicle (or focus object) STAYS at a fixed screen X. The world scrolls
past.** Anyone implementing a moving-object sim must follow this:

```ts
const VEHICLE_FIXED_X = W * 0.42;  // slightly LEFT of center → see more path AHEAD

// Convert world position → screen X
const worldToScreen = (worldS: number) =>
  VEHICLE_FIXED_X + (worldS - liveS) * meterPx;

// Distance markers shift left as vehicle "moves forward"
// Origin marker (0m, "শুরু" label) scrolls off when vehicle goes far enough
// Sky / sun / clouds stay at FIXED screen positions (infinite-distance items)
// Hills get slow parallax: -liveS * meterPx * 0.12 (far) and 0.22 (near)
// Dashed center line scrolls via ctx.lineDashOffset = -liveS * meterPx
```

### B. Single floating overlay pill (bottom-RIGHT, not bottom-center)
ALL playback controls go in ONE frosted-glass pill anchored to the bottom-right
of the scene canvas. NO separate bar below. NO speed selector.

```
[▶ Play] [↺ Reset] [− Zoom] [+ Zoom] [⛶ FS] [👻 Ghost N]
```

- Position: `right: 14px, bottom: 14px` (8px on mobile)
- Frosted glass: `rgba(255,255,255,0.88) + backdrop-filter: blur(10px)`
- Mobile compact (window.innerWidth < 700): Play 36px, others 28px (was 44/34)
- **NEVER put controls at bottom-center** — covers vehicle + 0m marker
- **NEVER add speed multipliers** — animation always plays at 1× wall-clock time

### C. Embedded sliders top-RIGHT, vehicle picker top-LEFT (inside canvas)
Master-Sab pedagogy preserved: variable sliders are part of the visual, not
in a separate panel. Vehicle picker stays as a vertical strip on the left.

- VehiclePickerOverlay: `top-2 left-2`, scrollable when narrow (so all 6
  emojis remain reachable — important on mobile fullscreen)
- EmbeddedSliders: `top-2 right-2`, four narrow vertical sliders (u/v/a/t etc.)
- Both use frosted glass, semi-transparent white background

### D. Distance markers ALWAYS visible (label-reserve trick)
Reserve 38px at the bottom of the canvas for distance labels. Otherwise short
mobile-landscape fullscreen heights push the labels off-canvas:

```ts
const labelReserve = 38;
const horizonY = H * 0.45;            // was 0.55 — too tall
const roadTop = horizonY + 6;
const roadHeight = Math.max(110, H * 0.32);
const roadBottom = Math.min(roadTop + roadHeight, H - labelReserve);
// Markers drawn at roadBottom + 22-24, always within H
```

### E. ResizeObserver — required for fullscreen toggle
Without this, the canvas reads container.clientWidth on first effect run and
keeps the old W/H when fullscreen toggles. Vehicle visibly off-position.

```ts
const [resizeKey, setResizeKey] = useState(0);
useEffect(() => {
  if (!containerRef.current) return;
  const obs = new ResizeObserver(() => setResizeKey((k) => k + 1));
  obs.observe(containerRef.current);
  return () => obs.disconnect();
}, []);

// Add `resizeKey` to the drawing useEffect's dep list:
useEffect(() => { /* draw */ }, [...stateDeps, resizeKey]);
```

### F. Fullscreen scroll restoration
Browser keeps scroll position from before fullscreen. After exit, the sim is
often off-screen below. Auto-scroll back:

```ts
useEffect(() => {
  const handler = () => {
    const isFs = Boolean(document.fullscreenElement);
    setIsFullscreen(isFs);
    if (!isFs) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 80);
    }
  };
  document.addEventListener('fullscreenchange', handler);
  return () => document.removeEventListener('fullscreenchange', handler);
}, []);
```

### G. Mobile fullscreen orientation lock
On `requestFullscreen`, lock to landscape if mobile:

```ts
if (isMobile && screen.orientation && 'lock' in screen.orientation) {
  (screen.orientation as any).lock?.('landscape').catch(() => {});
}
// On exit: screen.orientation.unlock()
```

### H. Fullscreen layout: scene 4/5 + side rail 1/5
Compact rail with formula + derivation + result + layers + 2 mini graphs:

```tsx
<div className="flex flex-row w-full h-full bg-black">
  <div className="flex flex-col flex-[4] min-w-0 relative">{sceneNode}</div>
  <div className="flex flex-col flex-[1] min-w-[180px] max-w-[280px]">
    <FullscreenSidePanel ... />
  </div>
</div>
```

The side panel applies CSS `zoom: 0.8` on `window.innerWidth < 900` so text
+ graph heights scale uniformly without per-component rewrites.

### I. computeDuration must derive t from kinematic relations
Without this, slider value (e.g., s=82m) doesn't match the animation distance.
For each equation, derive t when not directly given:

```ts
// 1st law: t = (v - u) / a
// 2nd law: ½at² + ut - s = 0 → quadratic positive root
// 3rd law: t = (v - u) / a (after solving v from v² = u² + 2as)
// 4th law: t = 2s / (u + v)
// Free fall: t = √(2h / g)
```

### J. Title 1.5× sizing
- Mobile stacked: subtitle text-[10px], title text-xl (was text-sm)
- Desktop one-line: title text-3xl + tracking-tight, subtitle text-sm

### K. Friendly Bangla error messages
Show errors as Bangla messages, never raw Math errors:
- `শূন্য দিয়ে ভাগ করা যায় না — অন্য মান চেষ্টা করো`
- `এই combination-এ ফলাফল কাল্পনিক হয়ে যাচ্ছে — মান বদলাও`
- `নেগেটিভ সময় সম্ভব না — অন্য মান চেষ্টা করো`

### L. Direction-aware emoji rendering
Emojis face LEFT by default on most platforms. Flip when moving right:

```ts
const naturalSign = spec.naturalFacing === 'left' ? -1 : 1;
if (spec.naturalFacing !== 'symmetric' && naturalSign !== dir) {
  ctx.scale(-1, 1);  // flip horizontally
}
```

---

## SESSION WORKFLOW (MANDATORY)

```
① PULL — git pull origin main
② DISCUSS — research + show user the plan + ask only what's truly ambiguous
③ SCAFFOLD — file structure + types
④ PHYSICS / LOGIC — pure module, fully unit-testable
⑤ STATE HOOK — useReducer + rAF animation loop
⑥ UI COMPONENTS — controls, sliders, dropdowns, toggles
⑦ CANVAS SCENE — custom rendering, vectors, markers
⑧ GRAPHS (optional) — live plotting
⑨ ENTRY + LAYOUT — MotionSim-style responsive grid
⑩ REGISTRY — add to src/simulations/registry.ts
⑪ DB SEED — INSERT row into `simulations` table, status='public'
⑫ BUILD — npm run build, confirm /sim/<slug> in output
⑬ COMMIT — focused commit with clear message + Co-Authored-By
⑭ PUSH — git push origin main
⑮ DEPLOY — Coolify redeploy main + admin if admin code touched
```

---

## STEP 1 — DISCUSS BEFORE CODING

Before writing a single line, do these in order:

### A. Identify the NCTB chapter
Pull from `src/data/classes.ts` (CHAPTER_NAMES). Confirm with user: "ক্লাস X, [Subject], অধ্যায় Y — [Chapter Name] — সঠিক?"

### B. Research benchmarks (ALWAYS)
- **PhET HTML5 sim** for the topic — search: `https://phet.colorado.edu/en/simulations/filter?subjects=<subject>&type=html`
- **Master Sab equivalent** if exists (Bangladeshi desktop app)
- Other Bangla edu apps: 10 Minute School, Shikho — note what's missing

For each benchmark, extract:
- Visual style (what to copy, what to avoid)
- Interaction pattern (slider-driven? drag? click?)
- Pedagogy (formula solver vs free exploration?)
- Multi-representation (graphs, vectors, numbers)

### C. Decide architecture
Standard template (mirror `physics/motion/`):
```
src/simulations/<subject>/<sim-slug>/
├── config.ts                 # SimulationConfig — variables, formulas, NCTB ref
├── types.ts                  # TS types for state shape
├── physics.ts                # PURE logic, all formulas + variants + validation
├── useXxx.ts                 # useReducer + rAF animation
├── XxxSim.tsx                # Entry — accepts { videoUrl?: string }
├── components/               # 8-15 components
│   ├── EquationTabs / ConceptTabs
│   ├── FormulaDropdown (if multiple variants)
│   ├── StepDerivation (if solver mode)
│   ├── ValueSliders (one per variable)
│   ├── ResultDisplay
│   ├── PlaybackBar (Play/Reset/Speed)
│   ├── LayerToggles
│   ├── ModeSwitch (Solver vs Explore)
│   ├── ErrorBanner (Bangla-friendly)
│   ├── XxxScene (custom Canvas)
│   ├── KinematicGraph / similar (live plot)
│   ├── ItemPicker (vehicle / element / specimen)
│   └── TutorialFAB (videoUrl prop)
└── (optional) drawingPrimitives.ts  # for shared Canvas drawing fns
```

### D. Identify what to ASK from user vs DECIDE yourself

**ALWAYS DECIDE yourself (no asking):**
- Component file paths and naming
- Color choice within brand palette
- Default values for sliders
- Animation timing (60fps standard)
- Code-drawn Canvas vs sprite (always code-drawn)
- Mobile layout breakpoints
- Validation rule wording
- Default selected variable in solver mode
- Ghost trail count (default 3)
- Speed options (default 0.25/0.5/1/2)

**ASK user only if:**
- Ambiguous scope: "Chapter only or extends?"
- Pedagogical conflict: NCTB ordering vs pedagogical clarity
- Multiple equally-valid approaches the user might prefer one of
- Cultural localization: which Bangladeshi context (CNG vs car vs motorcycle?)

**NEVER ASK:**
- "Should I use cartoon style?" (always yes)
- "What color?" (decide from palette)
- "Should I create the DB row?" (always yes, public)
- "Should I use NCTB Bangla?" (always yes, formula exact + narration friendly)

### E. Show user the plan in 1 message before coding
Format:
1. NCTB chapter + topic
2. PhET / Master Sab references found (with URLs if applicable)
3. What we'll beat each on
4. Component file list
5. Equations / phenomena to cover
6. Visual concept (1-2 sentences)
7. Animation flow
8. List of decisions taken (no asking)
9. List of asks (if any)

---

## STEP 2 — FILE STRUCTURE TEMPLATE

Mirror `src/simulations/physics/motion/` exactly:

### `config.ts`
```ts
import type { SimulationConfig } from '../../_template/config';

export const xxxConfig: SimulationConfig = {
  id: 'slug-here',
  slug: 'slug-here',
  title: { bn: 'বাংলা', en: 'English' },
  subject: 'physics' | 'chemistry' | 'biology' | 'math' | 'higher-math' | 'english',
  nctb: { class: 9 | 10, chapter: N, section: 'N.0' },
  variables: [
    { id: 'name', label: { bn, en }, unit, min, max, default, step },
    // ...
  ],
  formulas: [
    { expression: 'F = ma', description: { bn, en } },
    // ...
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 1200, height: 600 },
};
```

### `types.ts`
```ts
export type ConceptKey = 'first' | 'second' | ...;
export type VariableKey = 'a' | 'b' | ...;
export type Mode = 'solver' | 'explore';

export interface XxxState {
  mode: Mode;
  concept: ConceptKey;
  variantIndex: number;
  unknown: VariableKey | null;
  values: Record<VariableKey, number>;
  vehicle: VehicleKey;  // or relevant item
  playback: { status, elapsedMs, speed };
  layers: { ... booleans };
  ghosts: GhostRun[];
  error: ValidationError | null;
  lastResult: { variable, value } | null;
}
```

### `physics.ts` (PURE — no React)
- Define all equations + variants in `EQUATIONS: Record<ConceptKey, EquationDef>`
- Each variant has: `solves` (var), `expression` (display), `steps[]` (Bangla derivation), `requires[]`
- `solve(concept, unknown, vars): SolveResult` — returns either value or friendly Bangla error
- Friendly errors (NEVER raw Math errors):
  - শূন্য দিয়ে ভাগ করা যায় না — অন্য মান চেষ্টা করো
  - এই combination-এ ফলাফল কাল্পনিক হয়ে যাচ্ছে — মান বদলাও
  - নেগেটিভ সময় সম্ভব না — অন্য মান চেষ্টা করো
- Helper: `defaultVarsFor(concept)`, `defaultUnknownFor(concept)`, `computeDuration()`, `sampleTrajectory()`

### `useXxx.ts`
- useReducer with all SET_*, PLAY/PAUSE/RESET, TICK, FINISH, SAVE_GHOST actions
- `useEffect` for RECOMPUTE on values/equation/unknown change
- `useEffect` for animation rAF loop (gated on playback.status === 'playing')
- Return shape: `{ state, derived, actions }`

### `XxxSim.tsx`
```tsx
export interface XxxSimProps {
  videoUrl?: string;
}

export default function XxxSim({ videoUrl }: XxxSimProps = {}) {
  const { state, derived, actions } = useXxx();
  return (
    <div className="xxx-sim relative w-full" style={{
      background: 'linear-gradient(180deg, #0B1D3A 0%, #050D1F 100%)',
      color: '#FAFBF9',
      minHeight: 'min(720px, calc(100vh - 60px))',
    }}>
      {/* Top bar: title + NCTB chip + ModeSwitch */}
      {/* Equation/concept tabs */}
      {/* Responsive grid: lg:[320px_1fr] — controls left, scene+graphs right */}
      {/* TutorialFAB at end */}
    </div>
  );
}
```

---

## STEP 3 — CUSTOM CANVAS PATTERNS

### Setup boilerplate (every Scene)
```tsx
const [resizeKey, setResizeKey] = useState(0);
useEffect(() => {
  if (!containerRef.current) return;
  const obs = new ResizeObserver(() => setResizeKey((k) => k + 1));
  obs.observe(containerRef.current);
  return () => obs.disconnect();
}, []);

useEffect(() => {
  const canvas = canvasRef.current;
  const container = containerRef.current;
  if (!canvas || !container) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const cssW = container.clientWidth;
  const cssH = container.clientHeight;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.width = `${cssW}px`;
  canvas.style.height = `${cssH}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // ... draw ...
}, [...stateDeps, resizeKey]);  // resizeKey forces redraw on container size change
```

### Always include (Day-theme scene)
- **Day sky gradient** (#7CC2F0 → #B5DCEC → #E1F0F8 from top to horizon)
- **Sun** with radial-gradient glow in top-right (W*0.86, H*0.17, r=30)
- **3-4 fluffy clouds** at fixed screen positions (use `drawCloud(x, y, scale)` helper)
- **Distant hills** with parallax (sin-curve generated, far at 0.12× and near at 0.22× vehicle motion)
- **Grass strip** above + below road (#7BB661 → #5A9A4A gradients)
- **Road** dark gradient (#3E444E → #30353E → #3E444E) with yellow shoulder
  stripes (#FFC93C, 4px) and **white dashed center line** (5px wide, [34, 22]
  dash, animated via `ctx.lineDashOffset = -liveS * meterPx`)
- **Distance markers** below road with stroke-then-fill text (white on black)
- **Origin marker (0m)** with green vertical line + "শুরু" label above road
- **Object position** from physics (`positionAt(...)`) — vehicle at FIXED screen X
- **Velocity arrow** (green pill: `#16A34A` background, white text)
- **Acceleration arrow** (orange pill: `#EA580C` background, white text)
- **Ghost trails** (semi-transparent, max 3)
- **Floating live readout** above vehicle: `t: X.XXs · s: Y.Ym` (dark pill)
- **Reserve 38px at bottom** for label visibility on short heights

### Vehicle/object drawing — emoji-first
**Use system emojis, NOT custom Canvas drawing.** This was a major iteration
decision — code-drawn primitives looked cartoonish; user demanded "realistic".
Apple/Google/MS emoji fonts give photorealistic-quality renders for free.

```ts
ctx.font = `${size}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
// Direction-aware flip — emojis face LEFT by default on most platforms
if (naturalFacing === 'left' && direction > 0) ctx.scale(-1, 1);
ctx.fillText(emoji, 0, 0);
```

Standard vehicle set (mirrors `src/simulations/physics/motion/vehicles.ts`):
- 🚗 sedan (size 125, faces left)
- 🏍️ motorcycle (114, faces left)
- 🛺 CNG / auto-rickshaw (120, faces left)
- 🚲 bicycle (109, faces left)
- 🚀 rocket (114, faces right — exception)
- ⚽ football / ball (78, symmetric — rotates with motion)

For new domains (chemistry, biology), think of analogous emojis:
- Chemistry: 🧪 ⚗️ 🔬 🧫 ⚛️
- Biology: 🌱 🌿 🍃 🦠 🧬 🌸
- Physics: 🔋 💡 🧲 🔭 ⚖️

If no suitable emoji exists, fall back to lightweight SVG (still NOT
3D / photorealistic / stock raster).

### Arrow helper (copy-paste from RoadScene.tsx)
```ts
function drawArrow(ctx, x1, y1, x2, y2, color, width) { ... }
```
Plus pill-style label: `roundRect` background + white text centered on shaft midpoint.

---

## STEP 4 — STATE + INTERACTION PATTERNS

### Mode toggle
- Solver mode: pick equation tab → pick variant (which var to solve) → enter knowns → see step derivation + animation
- Explore mode: all sliders live → instant scene update, no "solve" concept

### Layer toggles
- Velocity / Acceleration arrows
- Distance markers
- Ghost trail
- Live graphs (v-t, s-t)
- Sound (optional)

### Playback bar
- Play / Pause / Reset
- Speed: 0.25× / 0.5× / 1× / 2×
- "+ Ghost" button + count + clear

### Ghost compare (always include)
- Save current run as ghost (max 3)
- Render at 25-35% opacity in different colors: `#9CA3AF`, `#FCD34D`, `#F87171`
- Cleared on equation change

---

## STEP 5 — REGISTRY + DB SEED + ROUTING

### Add to registry
`src/simulations/registry.ts`:
```ts
import { xxxConfig } from './<subject>/<slug>/config';

export const simulations: SimRegistryEntry[] = [
  // ... existing ...
  {
    slug: 'xxx',
    config: xxxConfig,
    component: () => import('./<subject>/<slug>/XxxSim'),
  },
];
```

### Add to /sim/[slug] router
`src/app/sim/[slug]/page.tsx` SIMULATION_COMPONENTS map:
```ts
import XxxSim from '@/simulations/<subject>/<slug>/XxxSim';

const SIMULATION_COMPONENTS: Record<string, SimComponent> = {
  motion: MotionSim,
  xxx: XxxSim,
};
```

### Add fallback thumbnail
`src/components/simulations/simThumbnails.ts` — add an inline SVG entry. Even though admin can override, the code fallback handles cold-start / if admin clears it.

### Seed DB row
Use the pg/query Python pattern:
```python
import json, urllib.request
env = {}  # load from .env.local
key = env['SUPABASE_SERVICE_ROLE_KEY']
sql = """
INSERT INTO simulations (
  slug, title_bn, title_en, description_bn, description_en, long_description_bn,
  subject, nctb_class, nctb_chapter, nctb_section,
  status, order_index, tags, duration_minutes, difficulty
) VALUES (
  'xxx-slug', 'বাংলা শিরোনাম', 'English Title',
  'এক-দুই লাইন description gallery card-এর জন্য।',
  'One-two line English description.',
  'বিস্তারিত description, NCTB-ভিত্তিক, কী শিখবে। এই sim-এ student পারবে... etc.',
  'physics', 9, 2, '2.0',
  'public', 2,  -- next order_index
  ARRAY['tag1','tag2','SSC','NCTB'],
  15,  -- duration_minutes
  2    -- difficulty 1-5
) ON CONFLICT (slug) DO UPDATE SET
  title_bn = EXCLUDED.title_bn,
  description_bn = EXCLUDED.description_bn,
  long_description_bn = EXCLUDED.long_description_bn,
  updated_at = NOW();
"""
# POST to https://api.suttro.app/pg/query with apikey + Authorization headers
```

**FILL ALL FIELDS — never leave NULL.** User edits if they want, but you set good defaults.

### Verify routing
After registry + DB seed, run `npm run build` and confirm `/sim/<slug>` shows up in the SSG output.

---

## STEP 6 — TEXT WRITING GUIDE

### Title (DB title_bn)
- Single noun phrase, NCTB chapter name
- Examples: গতি, নিউটনের গতিসূত্র, আলোর প্রতিফলন

### Short description (DB description_bn)
- 1-2 sentences
- Mention what concept + which NCTB chapter + key formulas
- Example: "NCTB ক্লাস ৯-১০ পদার্থবিজ্ঞান অধ্যায় ২। গতির ৪টি সূত্র + মুক্ত পতন। সমাধান ও অনুসন্ধান দুই মোডে কাজ করে।"

### Long description (DB long_description_bn)
- 2-4 sentences
- What student will be able to do
- Mention realistic examples (গাড়ি, মোটরসাইকেল, etc.)
- Mention modes
- Example pattern: "এই সিমুলেশনে তুমি বাস্তব সময়ের [items]] দিয়ে [concepts] ([formulas]) এবং [bonus topic] বোঝতে পারবে। [Mode 1]-এর জন্য [benefit]। [Mode 2]-তে [benefit]।"

### Variable labels (in config.ts)
- Standard physics: u/v/a/s/t = আদিবেগ/শেষবেগ/ত্বরণ/সরণ/সময়
- Always include unit: m/s, m/s², m, s, V, A, Ω, etc.

### Error messages (in physics.ts)
- Always Bangla, always actionable
- NEVER raw math like "NaN" or "Division by zero"
- See standard set above

### Step-by-step derivation (in physics.ts variants[].steps)
- Bullet pattern: "দেওয়া আছে: ...", "ধাপ-১: ...", "ধাপ-২: ..."
- Use Bangla numbers (১, ২, ৩) only in labels, English math symbols inside

---

## STEP 7 — DEPLOY

### Build verification (before commit)
```bash
cd "D:/APPS AND WEB/Suttro App"
npm run build 2>&1 | tail -30
```
Look for `/sim/<slug>` in the route list. Build must complete with no TS errors.

### Commit pattern
```
sim(<slug>): <one-line summary>

<2-4 sentence what this sim covers>

Architecture:
- Pure physics module — <equations>
- Custom Canvas scene — <key visuals>
- <Other notable components>

Pedagogy:
- Solver mode — <approach>
- Explore mode — <approach>
- <Multi-representation, ghost trails, etc.>

DB row seeded with status='public', order_index=N.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

### Push + deploy
```
git push origin main
# Trigger Coolify redeploy:
# - Main: https://coolify.suttro.app — resource d0ok448ks8s4kkcww444sgkw
# - Admin: bwscoksk88g40sck08sw4wso (only if admin code changed)
```

---

## STEP 8 — POST-CREATION CHECKLIST

After ship, user should be able to:

- [ ] See sim in `/simulations` gallery (status='public')
- [ ] Open `/sim/<slug>` and play with all controls
- [ ] See sim in admin panel `/simulations` list
- [ ] Edit text/description from `/simulations/<slug>` admin form
- [ ] Save → see edits live on suttro.app within revalidate window (60s)
- [ ] Toggle status (public ↔ private) and verify gallery hides private
- [ ] Add YouTube URL → verify FAB modal opens video
- [ ] Add thumbnail URL → verify gallery card uses it
- [ ] **Test fullscreen on real mobile (landscape)** — confirm bottom controls
      bar doesn't overlap the vehicle/object, right rail formulas/result
      visible in compact form
- [ ] **Confirm the right rail (`FullscreenSidePanel.tsx`) renders correctly**
      in fullscreen on both desktop (4/5 + 1/5 split) and mobile-landscape
- [ ] **For Android-affecting changes** (e.g., new immersive routes, native
      toolbar logic): bump versionCode + use the GitHub Actions CI workflow
      to build the AAB (local Windows box has only JDK 17; project requires
      JDK 21), then upload via existing Python automation (see Step 7 →
      Android section below)

---

## STANDARD ASKS (when truly needed)

If you must ask, these are the legitimate questions:

1. **Scope split:** "Chapter X-এ চারটা সূত্র — সব একটা sim-এ, নাকি প্রতি সূত্র alada sim?"
2. **Cultural items:** "এই sim-এ Bangladeshi context-এ কোন object সবচেয়ে relatable — গাড়ি, রিকশা, মোটরসাইকেল, নৌকা?"
3. **NCTB strict vs friendly:** "Equation derivation NCTB textbook word-for-word, নাকি student-friendly Bangla rephrase?"
4. **Pedagogy preference:** "Master Sab-style solver-first, নাকি PhET-style explore-first as default mode?"
5. **YouTube URL:** Only if user has channel ready — otherwise placeholder.

**NEVER ASK:**
- "Should I delete the old sim?" → Just do it (or don't, depending on context)
- "Should I make it public?" → Always public unless user said private
- "What color?" → Use brand palette
- "Should I commit?" → Always commit at end of session

---

## REFERENCE EXAMPLES

### Gold-standard sim
- `src/simulations/physics/motion/` — Motion (গতি)
- 20 files including 13 components, vehicles drawn in code, all 4 NCTB equations + free fall

### NOT to copy
- The deleted demo sims (ohms-law, light-reflection, etc.) used a generic dot-grid canvas + draggable objects. That pattern is OBSOLETE. Always custom canvas per sim.

### File-pattern reference (file-by-file, from Motion gold standard)
| File | Lines | Purpose |
|------|-------|---------|
| config.ts | 60-90 | Variables, formulas, NCTB metadata |
| types.ts | 100-140 | TS contracts |
| physics.ts | 350-450 | Equations + variants + solve + validate + computeDuration |
| useXxx.ts | 240-280 | useReducer + rAF animation (speed always 1) |
| vehicles.ts | 80-100 | Emoji map + drawVehicle helper |
| XxxSim.tsx | 200-260 | Entry + responsive layout + fullscreen branch |
| RoadScene.tsx | 380-440 | Custom Canvas day-theme scene |
| FreeFallScene.tsx | 280-340 | Vertical Canvas variant |
| FullscreenSidePanel.tsx | 110-140 | Compact rail (formulas + result + graphs) |
| SceneOverlayControls.tsx | 180-220 | Bottom-right floating pill |
| KinematicGraph.tsx | 180-220 | Live v-t / s-t with compact prop |
| EmbeddedSliders.tsx | 80-120 | Top-right sliders inside canvas |
| VehiclePickerOverlay.tsx | 70-100 | Top-left scrollable strip |
| Other UI components | 40-100 each | Sliders, tabs, dropdowns, toggles |

---

## DB SCHEMA REFERENCE (`simulations` table)

```sql
slug TEXT UNIQUE NOT NULL              -- matches registry.ts slug
title_bn TEXT NOT NULL                  -- gallery + page header
title_en TEXT
description_bn TEXT                     -- gallery card + SEO
description_en TEXT
long_description_bn TEXT                -- shown below player
subject TEXT NOT NULL                   -- physics/chemistry/biology/math/higher-math/english
nctb_class INT NOT NULL                 -- 9 or 10
nctb_chapter INT NOT NULL
nctb_section TEXT
youtube_url TEXT                        -- tutorial — pluggable, FAB renders modal
thumbnail_url TEXT                      -- external image (Drive / CDN)
thumbnail_svg TEXT                      -- inline SVG fallback
status TEXT DEFAULT 'public'            -- public/private/deleted
order_index INT DEFAULT 0               -- gallery sort
tags TEXT[]
duration_minutes INT
difficulty SMALLINT 1-5
```

---

## INFRA HOOKS

- **Migration apply endpoint:** POST `https://api.suttro.app/pg/query` with header `apikey: $SUPABASE_SERVICE_ROLE_KEY`
- **Coolify main app:** resource `d0ok448ks8s4kkcww444sgkw` at `https://coolify.suttro.app`
- **Coolify admin app:** resource `bwscoksk88g40sck08sw4wso`
- **Service role key:** in `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`
- **Repo:** https://github.com/shaaoonn/SuttroApp (push to `main`)

## ANDROID APK / AAB PIPELINE (when changes touch `android/**`)

Local Windows box has **only JDK 17**, but the project requires **JDK 21**
(`JavaVersion.VERSION_21` in `android/app/build.gradle`). DO NOT try to
build locally with `./gradlew bundleRelease` — it will silently no-op
or fail with "JAVA_HOME is not set". Use the CI workflow instead.

### Workflow: `.github/workflows/build-apk.yml`
- Auto-triggers on push to `main` when files in `android/**` change
- Sets up JDK 21 + Android SDK + decoded keystore from secrets
- Runs `assembleRelease` + `bundleRelease`
- Uploads two artifacts: `suttro-release-apk` and `suttro-release-aab`
- Typical run time: ~3.5 minutes

### Pre-flight checks before pushing Android changes
**Critical** — if any of these are uncommitted on `main`, CI WILL fail:
1. `android/app/google-services.json` — must contain
   `"package_name": "app.suttro.suttro"` (the new package). The legacy
   `com.suttro.app` block can stay too.
2. All `android/app/src/main/java/app/suttro/suttro/*.kt` files must be
   committed (LoginActivity, OnboardingActivity, SessionManager,
   SplashActivity, SuttroBridge, SuttroConfig, SuttroFirebaseService,
   util/SupabaseApi, MainContainerActivity).
3. The OLD `android/app/src/main/java/com/suttro/app/*.kt` files MUST be
   removed (deleted) — otherwise duplicate-class errors.

Run `git status android/app/src/main/java/` before pushing to confirm
these files are tracked + the old ones are deleted.

### Steps to ship a new Android version
```
# 1. Edit code (e.g., MainContainerActivity logic, gradle resources)
# 2. Bump versionCode + versionName in android/app/build.gradle
# 3. Update RELEASE_NAME + RELEASE_NOTES_BN in scripts/play/upload_internal.py
git add android/app/ scripts/play/upload_internal.py
git commit -m "android(<new-version>): <one-line summary>"
git push origin main
# 4. Watch the CI workflow (~3.5 min):
gh run list --workflow=build-apk.yml --limit 1
gh run watch <run-id> --exit-status
# 5. Download AAB artifact:
mkdir -p .ci-artifacts
gh run download <run-id> --name suttro-release-aab --dir .ci-artifacts/
mkdir -p android/app/build/outputs/bundle/release
cp .ci-artifacts/app-release.aab android/app/build/outputs/bundle/release/app-release.aab
# 6. Upload to Play Internal Testing as draft (service account):
PYTHONIOENCODING=utf-8 python scripts/play/upload_internal.py
# 7. Promote draft → completed (KNOWN LIMITATION):
PYTHONIOENCODING=utf-8 python scripts/play/promote_internal.py
# Will fail with "Only releases with status draft may be created on draft app".
# This is a Play Console restriction we cannot bypass via API.
# User must manually click "Save & publish" in Play Console (~30 sec).
```

### Keystore + service account
- Keystore: `android/app/suttro-release.keystore` — password `suttro2026`
  (set as both `SUTTRO_STORE_PASSWORD` and `SUTTRO_KEY_PASSWORD`)
- Service account JSON: `.secrets/play-publisher-key.json` (gitignored)
- Service account email: `suttro-play-publisher@suttro-app.iam.gserviceaccount.com`
- Service account has Admin permissions on Play Console (cross-Gmail bridge:
  Cloud project owned by `shaaoonn@gmail.com`, Play Console by
  `mdahsanullahshaon@gmail.com`)

### Why the API can't auto-promote
The Suttro app has a precarious account-standing history (suspension
context). When Play Console enters "draft app" review-pending status,
the API enforces `Only releases with status draft may be created on
draft app`. The first promotion of every new versionCode requires a
manual "Save & publish" in the browser. After that, subsequent edits
to that release CAN be done via API — but the draft → completed
transition itself cannot.

This is unchanged from v1.0.1. Do not attempt to find an API workaround;
none exists. Tell the user: "Upload done. ৩০ সেকেন্ডে Play Console-এ এক
click — Save & publish — তারপর testers update পাবে।"

---

## ANTI-PATTERNS — NEVER DO

### Process / workflow
❌ **Don't** ask "should I create the simulation?" — just create it
❌ **Don't** generate a sim without doing benchmark research first (PhET + Master Sab)
❌ **Don't** leave DB row blank for the user to fill — fill it yourself
❌ **Don't** set `status='private'` by default — always 'public'
❌ **Don't** commit without `npm run build` passing
❌ **Don't** push more than one logical sim per commit — one sim, one commit

### Visual / theme (lessons from Motion sim's 4+ rejection cycles)
❌ **Don't** use NIGHT / dark canvas — user explicitly said "দিনের মত হবে আকাশ দেখা যাবে"
❌ **Don't** draw vehicles from Canvas primitives — they look cartoonish even
   with effort. Use system emojis (🚗 🏍️ 🛺 🚲 🚀 ⚽). Photorealistic for free.
❌ **Don't** use stock 3D rendered images (Master Sab style — looks dated)
❌ **Don't** put road horizon at H * 0.55 — markers go off-screen on short heights.
   Use 0.45 + reserve 38px at the bottom for labels.
❌ **Don't** use generic dot-grid canvas — custom day-theme scene per sim.
❌ **Don't** put the vehicle at a moving screen position — it must STAY at fixed
   `W * 0.42` and the world scrolls past (camera-follow pattern).

### Controls / UX
❌ **Don't** add a speed multiplier (0.25× / 0.5× / 1× / 2×) — animation MUST
   play at 1× wall-clock time. User explicitly removed this.
❌ **Don't** put controls at bottom-CENTER — they cover the vehicle and 0m marker.
   Always bottom-RIGHT of canvas.
❌ **Don't** create a separate "PlaybackBar" row below the canvas — ALL controls
   go in the floating overlay pill inside the canvas.
❌ **Don't** position the vehicle picker without scroll — on mobile fullscreen,
   the football emoji at the bottom gets clipped. Always max-height + overflow-y.
❌ **Don't** show raw Math errors — always friendly Bangla messages.

### Tech / runtime
❌ **Don't** skip the ResizeObserver — Canvas dims won't update on fullscreen
   toggle, and the vehicle appears off-position until next state change.
❌ **Don't** forget the scroll-into-view on fullscreen exit — sim drifts off-screen.
❌ **Don't** trust `t` slider value alone for animation duration — derive `t`
   from kinematic relations in `computeDuration()` so slider/scene match.
❌ **Don't** skip the `videoUrl` prop on the sim entry component
❌ **Don't** forget to update `simThumbnails.ts` fallback even if admin will override

---

## ITERATION FEEDBACK PATTERN — what to expect

The Motion sim went through ~6 rounds of feedback before reaching the gold
standard. **This is normal.** Plan for it:

1. **First ship** — research + scaffold + initial code. User will tap fullscreen,
   try mobile, screenshot what's wrong.
2. **Round 2-3** — visual feedback ("রিয়েল হয়নি", "দিনের মত হবে", "বাটন গাড়ি
   ঢাকছে"). Pivot strategy if needed (e.g., emoji over custom drawing).
3. **Round 4-5** — fullscreen-specific issues, mobile-specific issues, marker
   visibility on short heights, scroll restore.
4. **Round 6** — final polish: title sizes, control positions, density.

**During each round:**
- User often shares screenshots — read carefully, note the layout problems
- Bangla feedback mixes English UI terms ("ফুল স্ক্রিন", "হিসাব কিতাব", "ফ্লোটিং")
- User explicitly authorizes destructive ops with "তুমি কর", "যদি দরকার করো"
- Don't ask for approval on each fix — execute, ship, wait for next feedback

**Common feedback triggers and fixes:**
| User says | Fix |
|-----------|-----|
| "গাড়ি ঢেকে যাচ্ছে" / "বাটন কাভার করছে" | Move overlay to bottom-RIGHT |
| "সংখ্যাগুলো দেখা যাচ্ছে না" | Reserve 38px bottom + lower horizonY |
| "ছোট ছোট দেখাচ্ছে" / "বড় হবে" | 1.5× font scale + bigger title |
| "রিয়েল হয়নি" | Switch to emoji rendering |
| "রাত হয়ে আছে" | Switch to day theme |
| "বাইরে চলে যাচ্ছে" (after fullscreen) | ResizeObserver |
| "স্ক্রল করে উপরে আসতে হয়" | scrollIntoView on FS exit |
| "চারপাশ সাদা" (mobile FS) | Edge-to-edge wrapper, no max-width |

---

## QUICK CHECKLIST (paste into your todos at session start)

### Setup
1. PULL — git pull origin main
2. SKILL — read this file
3. RESEARCH — PhET + Master Sab + NCTB chapter

### Plan
4. SCOPE — single equation or multi-equation? mode toggle (solver/explore)?
5. ASSETS — pick emojis (🚗 🏍️ 🛺 🚲 🚀 ⚽ for motion; choose analogous for new domain)
6. PLAN — show user one-message proposal (skip if obvious)

### Scaffold
7. FOLDER — `src/simulations/<subject>/<slug>/`
8. TYPES — types.ts with EquationKey, VariableKey, Mode, etc.
9. PHYSICS — physics.ts (PURE — equations + variants + solve + computeDuration)
10. STATE — useXxx.ts (useReducer + rAF, force speed=1)

### UI components (mirror Motion)
11. EquationTabs / FormulaDropdown / StepDerivation
12. ValueSliders / EmbeddedSliders (inside canvas, top-right)
13. VehiclePickerOverlay (top-left, scrollable)
14. SceneOverlayControls (bottom-right pill, no speed)
15. ResultDisplay / ErrorBanner (friendly Bangla)
16. KinematicGraph (with `compact?: boolean` prop)
17. FullscreenSidePanel (zoom: 0.8 on narrow viewports)

### Canvas (day theme + camera-follow)
18. ResizeObserver setup → `resizeKey` in useEffect deps
19. Day sky + sun + clouds + parallax hills (FIXED screen positions)
20. Road with yellow shoulders + dashed center (lineDashOffset animation)
21. Reserve 38px bottom for distance labels
22. Vehicle at FIXED `W * 0.42`, world scrolls via `worldToScreen()`
23. Velocity / accel pill arrows (green / orange + white text)
24. Floating readout above vehicle (dark pill: t + s)
25. Origin marker (0m) with "শুরু" label
26. Ghost trails (max 3, semi-transparent)
27. Direction-aware emoji flip

### Entry + integration
28. XxxSim.tsx with `videoUrl?: string` prop + 1.5× title + fullscreen branch
29. fullscreenchange listener → scrollIntoView on exit
30. Orientation lock (mobile fullscreen → landscape)
31. REGISTRY — add to `src/simulations/registry.ts`
32. ROUTER — add to `src/app/sim/[slug]/page.tsx` SIMULATION_COMPONENTS
33. THUMB — add fallback SVG to `src/components/simulations/simThumbnails.ts`

### Database + admin
34. DB SEED — INSERT row, status='public', fill all fields
35. ADMIN — verify row appears at `/admin/simulations/<slug>` for editing

### Verify + ship
36. BUILD — `npm run build`, verify `/sim/<slug>` SSG route appears
37. COMMIT — focused message with "Co-Authored-By"
38. PUSH — origin main
39. DEPLOY — Coolify auto-redeploy (or manual trigger of `d0ok448ks8s4kkcww444sgkw`)

### Anticipate iteration
40. Expect 4-6 rounds of polish feedback. Don't be defensive — execute fixes
    quickly. Reference the "Common feedback triggers" table in the
    ITERATION FEEDBACK PATTERN section above.
