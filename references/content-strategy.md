# সূত্র — Content Strategy & AI Pipeline

## NCTB Content Mapping

### Target Curriculum
- **Board**: NCTB (National Curriculum and Textbook Board, Bangladesh)
- **Classes**: 9 and 10 (SSC level)
- **Subjects**: Physics (পদার্থবিজ্ঞান), Chemistry (রসায়ন), Biology (জীববিজ্ঞান)

### Class 9 Physics — Priority Chapters for MVP
| Chapter | Topic (Bengali) | Topic (English) | Simulation Ideas |
|---------|----------------|-----------------|-----------------|
| 1 | ভৌত রাশি ও পরিমাপ | Physical Quantities & Measurement | Vernier caliper, screw gauge virtual tools |
| 2 | গতি | Motion | Velocity-time graph, projectile motion |
| 3 | বল | Force | Newton's laws demo, friction slider |
| 4 | কাজ, ক্ষমতা ও শক্তি | Work, Power & Energy | Energy conservation, pendulum |
| 5 | পদার্থের অবস্থা ও চাপ | States of Matter & Pressure | Boyle's law, hydraulic press |
| 6 | বস্তুর উপর তাপের প্রভাব | Effect of Heat | Heat expansion, thermometer |
| 7 | তরঙ্গ ও শব্দ | Waves & Sound | Wave properties, Doppler effect |
| 8 | আলোর প্রতিফলন | Light Reflection | Mirror ray diagrams, angle controls |
| 9 | আলোর প্রতিসরণ | Light Refraction | Snell's law, lens simulation |
| 10 | স্থির তড়িৎ | Static Electricity | Charge interaction, electric field lines |
| 11 | চল তড়িৎ | Current Electricity | **Ohm's law** (flagship), circuit builder |
| 12 | তড়িতের চুম্বক ক্রিয়া | Electromagnetic Effect | Motor, generator, solenoid |
| 13 | আধুনিক পদার্থবিজ্ঞান | Modern Physics | Atomic model, radioactive decay |

### MVP First 5 Simulations (Week 1-2)
1. **ওহমের সূত্র (Ohm's Law)** — Chapter 11 — Flagship demo
2. **আলোর প্রতিফলন (Light Reflection)** — Chapter 8 — Visual impact
3. **নিউটনের গতিসূত্র (Newton's Laws)** — Chapter 3 — Classic physics
4. **তরঙ্গ (Waves)** — Chapter 7 — Beautiful animation
5. **চল তড়িৎ সার্কিট (Circuit Builder)** — Chapter 11 — Most interactive

---

## AI-Powered Simulation Creation Pipeline

### The Secret Weapon: Claude Code
PhET takes 6-12 months per simulation with a team.
সূত্র uses Claude Code to generate React simulation components — target: 1 sim/hour.

### Claude Code Prompt Template
```markdown
## Task
Create a সূত্র simulation for: [CONCEPT NAME]

## NCTB Reference
- Class: [9/10]
- Subject: [Physics/Chemistry/Biology]
- Chapter: [number] — [chapter name]
- Key formula: [formula]

## Variables (user-controllable)
- [variable1]: range [min]-[max], unit [unit], default [value]
- [variable2]: range [min]-[max], unit [unit], default [value]

## Visual Elements
- [Describe what the simulation should look like]
- [Describe what changes when variables change]

## Technical Requirements
- React component with TypeScript
- HTML5 Canvas for rendering (dark background #0d1117)
- Dot grid background (radial-gradient dots)
- Floating control panel (top-right) with sliders
- Readout panel (bottom-left) with live values
- Follow Suttro player architecture (see references/simulation-engine.md)
- All labels in Bengali (Hind Siliguri font)
- Responsive — works at any size (inline and fullscreen)
- Export as: /src/simulations/physics/[slug]/[Name]Sim.tsx

## Example Output Structure
/src/simulations/physics/ohms-law/
├── OhmsLawSim.tsx       (main React component)
├── useOhmsLaw.ts        (physics calculation hook)
├── components/          (visual sub-components)
│   ├── Battery.tsx
│   ├── Resistor.tsx
│   ├── Wire.tsx
│   └── Bulb.tsx
└── config.ts            (variable ranges, defaults)
```

### Quality Checklist for Each Simulation
- [ ] Physics/chemistry/biology logic is CORRECT
- [ ] All Bengali labels spell-checked
- [ ] Works at 320px width (mobile) and 1920px (desktop)
- [ ] Control panel doesn't overlap simulation content
- [ ] Reset button returns to defaults
- [ ] Variables have reasonable min/max limits
- [ ] Real-time value updates (no lag)
- [ ] Canvas renders at 60fps on mid-range phones
- [ ] NCTB chapter/section correctly tagged
- [ ] Dark theme matches Suttro player spec

---

## Video Content Pipeline

### Daily Class Recording Workflow
```
1. শাওন records class (camera + screen capture)
2. Basic edit (trim start/end, add intro/outro)
3. Export as MP4 (1080p, H.264)
4. Upload to video CDN (Cloudflare Stream or Bunny.net)
5. CDN auto-generates HLS manifest + quality variants
6. Add metadata to database (chapter, date, title)
7. Available on suttro.app/classes immediately
```

### Video Metadata Schema
```typescript
interface ClassVideo {
  slug: string;           // "2026-04-02-ohms-law"
  title: {
    bn: string;           // "ওহমের সূত্র — ক্লাস রেকর্ডিং"
    en: string;
  };
  date: string;           // "2026-04-02"
  subject: 'physics' | 'chemistry' | 'biology';
  nctb: {
    class: 9 | 10;
    chapter: number;
    section?: string;
  };
  duration: number;        // seconds
  hlsUrl: string;          // CDN manifest URL
  thumbnailUrl: string;
  relatedSimulation?: string; // slug of related simulation
}
```

### Intro/Outro Template
```
Intro (5 seconds):
- সূত্র logo animation
- "সূত্র | suttro.app" text
- Chapter & topic title

Outro (5 seconds):
- "সিমুলেশন চালাও → suttro.app/sim/[slug]"
- সূত্র logo
- "বিজ্ঞান দেখো, বিজ্ঞান বোঝো।"
```

---

## Content Expansion Roadmap

### Phase 1 (Month 1-2) — Physics Class 9
- 5 flagship simulations
- Daily class recordings started
- MVP launch

### Phase 2 (Month 3-4) — Full Physics
- All 13 chapters covered (Class 9)
- Class 10 Physics started
- MCQ practice (basic)

### Phase 3 (Month 5-6) — Chemistry
- Class 9 Chemistry simulations
- Periodic table interactive
- Chemical reaction animations

### Phase 4 (Month 7-8) — Biology
- Class 9 Biology simulations
- Cell division step-by-step
- Digestive system interactive

### Phase 5 (Month 9-12) — Class 10 Complete
- All three subjects for Class 10
- Admission prep content
- Full offline library

---

## Competitive Research Summary

### PhET (phet.colorado.edu) — Gold Standard
- Tech: SceneryStack (custom HTML5 scene graph, TypeScript)
- 170+ simulations, 121+ languages, open source (GPLv3)
- Weakness: No curriculum mapping, dated UI, no video content

### Labster (labster.com) — Premium 3D
- Tech: Unity → WebGL (30s+ load time)
- 300+ simulations, $49-149/student/year
- Weakness: Too expensive for Bangladesh, no mobile browser support

### Gizmos (gizmos.explorelearning.com) — School-Focused
- Tech: HTML5 Canvas + JavaScript
- 550+ simulations, US curriculum aligned
- Weakness: Paid only, English only, no mobile app

### Falstad (falstad.com) — Solo Developer Inspiration
- Tech: Pure JavaScript + HTML5 Canvas (no framework)
- Circuit simulator — proof that ONE person can build great simulations
- Weakness: Dated UI, no curriculum mapping

### সূত্র's Advantage Over ALL of Them
1. NCTB-aligned (none of them are)
2. Bengali-first (none of them are)
3. Teacher + simulation combo (none of them have class recordings)
4. Claude Code content pipeline (10-100x faster than traditional development)
5. Mobile-first PWA (Labster doesn't work on phones, PhET has dated mobile UX)
