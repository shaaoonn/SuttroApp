# সূত্র — Claude Code Workflow Rules

## ⚠️ READ THIS FILE FIRST — EVERY SESSION

## Project Location
```
Local Path:  D:\APPS AND WEB\Suttro App\
GitHub:      https://github.com/shaaoonn/SuttroApp

ফোল্ডার স্ট্রাকচার:
D:\APPS AND WEB\Suttro App\
├── SKILL.md              ← মূল স্কিল ফাইল (সর্বদা আপডেট রাখো)
├── references/            ← বিস্তারিত স্পেক ফাইলসমূহ (সর্বদা আপডেট রাখো)
│   ├── branding.md
│   ├── claude-code-rules.md  ← তুমি এখন এটা পড়ছো
│   ├── content-strategy.md
│   ├── hybrid-app.md
│   ├── player-system.md
│   ├── simulation-engine.md
│   ├── sitemap-features.md
│   └── tech-stack.md
├── src/                   ← সোর্স কোড (Next.js)
├── public/                ← স্ট্যাটিক ফাইলস
├── package.json
└── ...
```

### SKILL.md ও references/ — এগুলো repo-র অংশ!
এই ফাইলগুলো প্রজেক্ট রুটেই থাকে এবং git-এ track হয়।
প্রতি push-এ GitHub-এও আপডেট হয়ে যায়।
ফলে যেকোনো মেশিনে clone করলে skill + references সহ পুরো প্রজেক্ট পাওয়া যায়।

---

## Rule 1: Session Start Protocol (MANDATORY)

Every time you start working on সূত্র, follow these steps IN ORDER:

### Step 1: Pull Latest
```bash
cd /path/to/SuttroApp
git pull origin main
```

### Step 2: Research Latest Tech
Before writing ANY code, search the internet for:
```
Search queries to run:
- "Next.js [current version] new features [current year]"
- "[specific tech you're about to use] best practices [current year]"
- "HTML5 Canvas performance optimization latest"
- "[whatever feature you're building] modern approach"
```

**Why**: Technology changes fast. What was best practice 3 months ago might be
outdated. 30 seconds of research can save hours of rework.

**Examples**:
- Building simulation? → Search "HTML5 Canvas 2D simulation performance 2026"
- Adding HLS player? → Search "best HLS player library 2026 comparison"
- Setting up auth? → Search "Supabase phone OTP latest setup"
- Adding pan/zoom? → Search "canvas pan zoom pinch mobile best library 2026"

### Step 3: Read Skill Files
```
1. Read this file (claude-code-rules.md) — you're doing it now ✓
2. Read SKILL.md — check PROGRESS TRACKER for current state
3. Read the relevant references/ file for what you're building
```

### Step 4: Build
Now you can start coding.

### Step 5: Update & Push
```bash
# 1. Update PROGRESS TRACKER in SKILL.md
# 2. Commit with descriptive message
git add .
git commit -m "feat: [what you built] — [brief detail]"
git push origin main
```

---

## Rule 2: Simulation Template System

### The Template (`src/simulations/_template/`)
This is an EMPTY simulation player with ALL framework code:
- Dot grid background ✓
- Canvas setup ✓
- Pan/zoom (hand mode) ✓
- Object interaction (mouse mode) ✓
- Bottom toolbar (zoom, fit, mode toggle, fullscreen) ✓
- Floating control panel (empty slots) ✓
- Readout panel (empty slots) ✓
- Top bar (chapter info) ✓
- Responsive layout ✓
- Dark theme ✓

### Creating a New Simulation
```bash
# NEVER build a simulation from scratch. ALWAYS:

# 1. Copy template
cp -r src/simulations/_template/ src/simulations/physics/ohms-law/

# 2. Rename main component
mv src/simulations/physics/ohms-law/TemplateSim.tsx \
   src/simulations/physics/ohms-law/OhmsLawSim.tsx

# 3. Edit config.ts with simulation-specific variables
# 4. Add physics/chemistry/biology logic in useSimulation hook
# 5. Add visual components (circuit elements, molecules, etc.)
# 6. Register in src/simulations/registry.ts
# 7. Add route in app/sim/[slug]/page.tsx
```

### Template File Structure
```
src/simulations/_template/
├── TemplateSim.tsx          # Main component (rename for each sim)
├── useSimulation.ts         # Physics/logic hook (customize per sim)
├── config.ts                # Variables, limits, defaults (EDIT THIS)
├── components/
│   ├── SimObject.tsx         # Draggable simulation object base
│   └── Wire.tsx              # Connection line component
└── README.md                # Template usage instructions
```

### What to Customize (per simulation)
```typescript
// config.ts — EDIT THIS for each simulation
export const simConfig: SimulationConfig = {
  id: 'ohms-law',
  slug: 'ohms-law',
  title: { bn: 'ওহমের সূত্র', en: "Ohm's Law" },
  subject: 'physics',
  nctb: { class: 9, chapter: 11, section: '11.1' },
  variables: [
    { id: 'voltage', label: { bn: 'ভোল্টেজ', en: 'Voltage' }, unit: 'V', min: 0, max: 24, default: 5, step: 0.5 },
    { id: 'resistance', label: { bn: 'রোধ', en: 'Resistance' }, unit: 'Ω', min: 1, max: 100, default: 10, step: 1 },
  ],
  formulas: [
    { expression: 'V = IR', description: { bn: 'ভোল্টেজ = কারেন্ট × রোধ', en: 'Voltage = Current × Resistance' } }
  ],
  defaultZoom: 1.0,
  canvasSize: { width: 800, height: 600 },
};
```

### What NOT to Customize
- Player shell (topbar, bottombar) — comes from template
- Pan/zoom behavior — comes from template
- Hand/Mouse mode toggle — comes from template
- Fullscreen behavior — comes from template
- Dot grid background — comes from template
- Control panel frame — comes from template (just fill the slots)
- Readout panel frame — comes from template (just fill the slots)

---

## Rule 3: Git Conventions

### Branch Strategy
```
main — production-ready code (always deployable)
```
For now, work directly on main. When the team grows, switch to:
```
main — production
dev — development
feat/[feature-name] — feature branches
```

### Commit Message Format
```
type: brief description

Types:
  feat:     New feature (simulation, page, component)
  fix:      Bug fix
  style:    Branding/CSS/design changes
  refactor: Code restructuring (no feature change)
  docs:     Documentation/SKILL.md updates
  chore:    Build config, dependencies
  sim:      New simulation created

Examples:
  feat: add simulation player template with pan/zoom
  sim: create Ohm's Law simulation (physics ch.11)
  fix: mobile touch targets too small in control panel
  style: update button colors to match branding guide
  docs: update SKILL.md progress tracker
```

### Push After EVERY Session
```bash
# Even if work is incomplete — push with WIP prefix:
git commit -m "wip: partial circuit builder component"
git push origin main
```

---

## Rule 4: File Naming Conventions

### Components
```
PascalCase.tsx — React components
  SimulationPlayer.tsx
  ControlPanel.tsx
  OhmsLawSim.tsx

camelCase.ts — hooks, utils, configs
  useSimulation.ts
  usePanZoom.ts
  config.ts

kebab-case/ — folders
  ohms-law/
  light-reflection/
  acid-base/
```

### Simulation Slugs
```
Format: [concept-in-english-kebab-case]
Examples:
  ohms-law
  light-reflection
  newtons-first-law
  acid-base-neutralization
  cell-division-mitosis
```

### CSS Classes (Tailwind)
Follow branding guide — use CSS variables from `globals.css`:
```css
/* globals.css — brand tokens */
@layer base {
  :root {
    --suttro-deep: #0B1D3A;
    --suttro-primary: #1B6B4A;
    --suttro-accent: #E8A838;
    /* ... full palette from branding.md */
  }
}
```

---

## Rule 5: Quality Checklist (Run Before Every Push)

```
Before git push, verify:

□ Code compiles without errors (npm run build)
□ No TypeScript errors
□ Responsive at 320px, 768px, 1024px, 1440px
□ Dark simulation canvas renders correctly
□ Bengali text displays properly (Hind Siliguri loaded)
□ Touch targets ≥ 44px on mobile
□ Fullscreen toggle works
□ Pan/zoom works in hand mode (if applicable)
□ PROGRESS TRACKER updated in SKILL.md
□ Descriptive commit message written
```

---

## Rule 6: SKILL.md Update Protocol

### After EVERY Session, Update:

**1. PROGRESS TRACKER** — Change status symbols:
```
⬜ Pending → 🔄 In Progress → ✅ Done → ❌ Blocked
```
Add date when status changes.

**2. Simulation Registry** — When new sim is created:
```markdown
| ohms-law | Physics | Ch.11 | 9 | ✅ Done |
```

**3. Architectural Decisions** — If you make a new decision:
```markdown
### New Decision: [date]
Decided to use [X] instead of [Y] because [reason].
```

**4. Known Issues** — If something is broken:
```markdown
### Known Issues
- [ ] Pan/zoom jitters on iOS Safari (needs pointer-events fix)
```

**5. References Update** — যদি কোনো নতুন বড় সিদ্ধান্ত হয়:
```
কোন references/ ফাইলে আপডেট করবে:
• নতুন কালার/ফন্ট সিদ্ধান্ত → branding.md
• ক্যানভাস বিহেবিয়র পরিবর্তন → simulation-engine.md
• প্লেয়ার ফিচার যোগ → player-system.md
• অফলাইন/অ্যাপ সংক্রান্ত → hybrid-app.md
• নতুন পেজ/রাউট যোগ → sitemap-features.md
• নতুন টেক ডিসিশন → tech-stack.md
• NCTB ম্যাপিং পরিবর্তন → content-strategy.md
• workflow নিয়ম পরিবর্তন → claude-code-rules.md (এই ফাইল)
```

**মনে রাখো: SKILL.md + references/ ফাইলগুলো হলো সূত্র-র "brain" —**
**এগুলো আপডেট না রাখলে পরবর্তী সেশনে ভুল সিদ্ধান্ত হবে।**

---

## Rule 7: Research Checklist by Feature

| Feature Being Built | Search Before Building |
|-------------------|----------------------|
| Simulation canvas | "html5 canvas 2d performance [year]", "react canvas component pattern" |
| Pan/zoom | "canvas pan zoom pinch mobile [year]", "css transform performance" |
| Video player | "hls.js vs video.js [year]", "best video player react [year]" |
| Auth (Phone OTP) | "supabase phone auth setup [year]", "bangladesh sms gateway" |
| Offline/PWA | "next-pwa setup [year]", "service worker cache strategy" |
| Deep linking | "android app links setup [year]", "deferred deep linking free" |
| Payment | "bkash api integration nodejs [year]", "nagad payment gateway" |
| Deployment | "coolify next.js deploy [year]", "docker next.js standalone" |

---

## Rule 8: Template-First Development Order

**BUILD ORDER (strict sequence):**

```
1. ████████ TEMPLATE FIRST ████████████████████████████
   Build the empty simulation player template.
   This is THE FOUNDATION. Everything else copies from this.
   - Dot grid canvas
   - Pan/zoom handler
   - Hand/mouse mode toggle
   - Bottom toolbar
   - Floating control panel (empty slots)
   - Readout panel (empty slots)
   - Fullscreen toggle
   - Responsive breakpoints
   Save as: src/simulations/_template/

2. ████████ FIRST SIMULATION ████████████████████████████
   Copy template → build Ohm's Law simulation.
   This validates the template works.

3. ████████ SECOND SIMULATION ████████████████████████████
   Copy template → build Light Reflection simulation.
   This validates the template is REUSABLE.

4. ████████ WEBSITE ████████████████████████████████████
   Build pages AFTER simulations work.
   Homepage hero embeds the Ohm's Law sim.

5. ████████ VIDEO PLAYER ████████████████████████████████
   Same player shell, swap canvas for <video>.
```

**Why this order**: If the template is wrong, every simulation built on it
will be wrong. Get the template perfect FIRST, then stamp out simulations.
This is like making a mold before casting — invest time in the mold.

---

## Rule 9: Bengali Text Guidelines

### Always Use Bengali For
- UI labels, buttons, navigation
- Simulation titles and descriptions
- Error messages
- Tooltips and hints

### Always Use English For
- Variable units (V, A, Ω, W, Hz, m/s)
- Formula expressions (V = IR)
- Code/technical identifiers
- URL slugs

### Mixed Example
```
Title: ওহমের সূত্র সিমুলেশন (Bengali)
Label: ভোল্টেজ (Bengali) → 5V (English unit)
Formula: V = IR (English)
Button: সিমুলেশন চালাও → (Bengali)
URL: suttro.app/sim/ohms-law (English)
```

---

## Rule 10: Emergency Recovery

If something goes wrong:
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git checkout -- .

# Force pull (overwrite local)
git fetch origin
git reset --hard origin/main
```
