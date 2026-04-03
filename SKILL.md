---
name: suttro-platform
description: >
  Build সূত্র (Suttro) — Bangladesh's first interactive science simulation platform.
  suttro.app is a responsive Next.js PWA with Canvas-based simulations, video class recordings,
  Google Maps-style pan/zoom canvas, YouTube-like player (inline + fullscreen), encrypted offline downloads,
  deep linking, and hybrid WebView mobile app. Target: NCTB Class 9-10 Physics, Chemistry, Biology.
  Use this skill whenever the user mentions: সূত্র, Suttro, suttro.app, science simulation,
  বিজ্ঞান সিমুলেশন, interactive lab, virtual lab, simulation player, simulation canvas,
  NCTB simulation, or any related development task.
  ALL branding, architecture, and UX decisions are documented — build without asking questions.
  For detailed specs, read the relevant file from references/ folder.
---

# সূত্র | suttro.app — Complete Platform Skill

## ⚠️ CRITICAL INSTRUCTIONS — ALWAYS FOLLOW

### 1. Repository & Local Paths
```
GitHub:  https://github.com/shaaoonn/SuttroApp
Local:   D:\APPS AND WEB\Suttro App\
Skill:   D:\APPS AND WEB\Suttro App\SKILL.md
Refs:    D:\APPS AND WEB\Suttro App\references\
```
**SKILL.md ও references/ ফাইলগুলো প্রজেক্টের রুটেই থাকে — GitHub repo-তেও push হবে।**
**ALWAYS push after every work session.** Never leave uncommitted work.

### 2. Every Session Workflow (MANDATORY)
```
প্রতিবার কাজ শুরু করার আগে — এই ৬টি ধাপ অবশ্যই অনুসরণ করো:

① PULL — git pull origin main (latest code নাও)
② READ SKILL — SKILL.md পড়ো, PROGRESS TRACKER চেক করো কোথায় আছি
③ RESEARCH — ইন্টারনেট থেকে latest tech/best practices চেক করো
   (যেমন: "Next.js 15 new features", "Canvas API latest", "best HLS player 2026")
④ READ REFS — যে ফিচার বানাবে সেই references/ ফাইল পড়ো
⑤ BUILD — কাজ করো (simulation/feature/fix)
⑥ UPDATE & PUSH —
   • SKILL.md-র PROGRESS TRACKER আপডেট করো ✅/🔄/⬜
   • references/ ফাইলে নতুন decision হলে যোগ করো
   • git add . && git commit -m "descriptive message" && git push
```
**নোট: SKILL.md ও references/ ফাইলগুলো repo-র অংশ — push করলে GitHub-এও আপডেট হবে।**

### 3. Simulation Creation Protocol
```
নতুন সিমুলেশন তৈরির জন্য:

① NEVER build from scratch. ALWAYS copy the empty template:
   cp -r src/simulations/_template/ src/simulations/physics/[new-sim]/

② Template location: src/simulations/_template/
   (এটা একটা ফাঁকা সিমুলেশন player — সব branding, canvas, toolbar, pan/zoom সেটআপ করা)

③ Copy-তে শুধু simulation logic, variables, এবং visual elements যোগ করো
④ এতে সব সিমুলেশনে consistent branding, player behavior, এবং UX বজায় থাকবে
```

### 4. Skill File Update Rule
```
প্রতিটি কাজের পর এই SKILL.md ফাইলে:
• PROGRESS TRACKER সেকশন আপডেট করো (কী হলো, কী বাকি)
• নতুন কোনো architectural decision হলে সেটা document করো
• নতুন সিমুলেশন তৈরি হলে registry-তে যোগ করো
```

→ **Full workflow rules**: `references/claude-code-rules.md`

---

## Reference Files (read as needed)
| File | When to read |
|------|-------------|
| `references/claude-code-rules.md` | **ALWAYS READ FIRST** — workflow, git, template, naming conventions |
| `references/branding.md` | Logo, colors, typography, voice, social media, UI components |
| `references/simulation-engine.md` | Canvas UX, pan/zoom, hand/mouse modes, dot grid, simulation creation |
| `references/player-system.md` | Video + simulation player, inline/fullscreen, bottom toolbar |
| `references/hybrid-app.md` | PWA, WebView shell, offline downloads, deep linking, DRM |
| `references/sitemap-features.md` | Page structure, navigation, NCTB mapping, Shikho comparison |
| `references/tech-stack.md` | Next.js, Canvas API, database, deployment, infra |
| `references/content-strategy.md` | AI-powered simulation generation, NCTB content pipeline |

---

## 🏷️ BRAND IDENTITY (Quick Reference)

| Field | Value |
|-------|-------|
| বাংলা নাম | সূত্র |
| ইংরেজি | Suttro |
| ডোমেইন | suttro.app |
| Handle | @suttroapp (all platforms) |
| Display Name | সূত্র \| suttro.app |
| Primary Tagline | বিজ্ঞান দেখো, বিজ্ঞান বোঝো। |
| English Tagline | See science. Understand science. |
| Closing Line | বিজ্ঞান পড়া নয়, বিজ্ঞান করা। |
| Target Audience | NCTB Class 9-10 students, Bangladesh |
| Primary Language | বাংলা (Bengali) |

### Colors (CSS Variables)
```css
--suttro-deep: #0B1D3A;       /* headers, dark bg, text */
--suttro-primary: #1B6B4A;     /* buttons, links, brand green */
--suttro-primary-light: #2A9D6E; /* success, positive */
--suttro-accent: #E8A838;      /* highlights, CTA, badges */
--suttro-sky: #E4F0F6;         /* light backgrounds */
--suttro-surface: #FAFBF9;     /* page background */
--suttro-red: #C4392D;         /* errors */

/* Subject-specific colors */
--physics: #2563EB;   /* Electric Blue */
--chemistry: #7C3AED; /* Vivid Purple */
--biology: #059669;   /* Emerald */
```

### Typography
| Purpose | Font | Weights |
|---------|------|---------|
| বাংলা (all) | Hind Siliguri | 400, 500, 600, 700 |
| English display | DM Serif Display | 400, 400i |
| English body | DM Sans | 400, 500, 600, 700 |
| Code/data/formulas | JetBrains Mono | 400, 500 |

### Type Scale
- H1: 36px/700 · H2: 28px/600 · H3: 22px/600 · H4: 18px/500
- Body: 16px/400 (line-height: 1.7) · Small: 14px/400
- Border-radius: Icon=6px, Button=10px, Card=14px, Modal=20px

→ **Full branding spec**: `references/branding.md`

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    suttro.app (Next.js 14+ PWA)              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Simulation Engine (HTML5 Canvas + React Components)   │  │
│  │  • Dot-grid background (graph paper)                   │  │
│  │  • Google Maps-style pan/zoom (hand mode)              │  │
│  │  • Direct interaction (mouse mode)                     │  │
│  │  • Fixed floating control panels                       │  │
│  │  • YouTube-like inline ↔ fullscreen toggle             │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Video Player (HLS Streaming)                          │  │
│  │  • Same player shell as simulations                    │  │
│  │  • Inline + fullscreen (YouTube pattern)               │  │
│  │  • Daily class recordings archive                      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────┐ ┌───────────┐ ┌────────────┐ ┌───────────┐  │
│  │ User Auth │ │ Dashboard │ │  Payment   │ │ Content   │  │
│  │ Phone OTP │ │ Progress  │ │ bKash/Nagad│ │ API (NCTB)│  │
│  └───────────┘ └───────────┘ └────────────┘ └───────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL (Supabase) + Redis + Coolify/Contabo VPS  │  │
│  └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
        ▲               ▲               ▲
        │               │               │
   ┌────┴────┐   ┌──────┴──────┐  ┌─────┴─────┐
   │ Desktop │   │ Mobile      │  │  Hybrid   │
   │ Browser │   │ Browser     │  │  App      │
   │ (PWA)   │   │ (Responsive)│  │ (WebView) │
   └─────────┘   └─────────────┘  └───────────┘
```

→ **Full tech stack**: `references/tech-stack.md`

---

## 🎮 SIMULATION CANVAS — KEY UX RULES

### Three-Layer Architecture
1. **Layer 1 — Dot Grid Background**: CSS `radial-gradient` dots. Moves with pan/zoom.
2. **Layer 2 — Simulation Objects**: Batteries, resistors, wires, molecules etc. `transform: translate(x,y) scale(z)` for pan/zoom.
3. **Layer 3 — Fixed UI Overlay**: Control panels, readouts, toolbar. `position: absolute`, stays fixed during pan/zoom.

### Two Interaction Modes (toggle in bottom toolbar)
| Mode | Icon | Cursor | Can Pan/Zoom | Can Move Objects |
|------|------|--------|-------------|-----------------|
| Mouse (default) | 🖱️ Arrow cursor | Arrow | ❌ No | ✅ Yes |
| Hand | ✋ Grab cursor | Grab/Grabbing | ✅ Yes | ❌ No |

### Bottom Toolbar (left to right)
```
[সূত্র | suttro.app]  ···  [125%] [-] [+]  |  [⤢ Fit]  |  [✋ Hand] [🖱️ Mouse]  |  [⛶ Fullscreen]
```

### Player Rules (applies to BOTH video and simulation)
1. **Self-contained**: ALL controls inside the player. Nothing outside.
2. **Inline ↔ Fullscreen**: One click toggle. `element.requestFullscreen()`. No content difference.
3. **Responsive**: CSS handles resizing. No JS re-render needed.
4. **Mobile**: Inline = 100% width. Fullscreen = landscape rotation. Touch-friendly (44px+ targets).

→ **Full simulation spec**: `references/simulation-engine.md`
→ **Full player spec**: `references/player-system.md`

---

## 📱 HYBRID APP MODEL

### "Build Once, Run Everywhere"
```
suttro.app (Next.js PWA)
  ├── Desktop Browser → suttro.app directly
  ├── Mobile Browser → suttro.app (responsive)
  ├── Android App → WebView shell loading suttro.app (Play Store)
  ├── iOS App → WKWebView shell loading suttro.app (App Store)
  └── PWA Install → Home screen icon + offline support
```

### Offline Content Model (Netflix pattern)
- **Online**: Everything streams from server
- **Download button**: On each video/simulation
- **Offline**: Downloaded content plays ONLY inside app (encrypted storage)
- **Cannot**: Find in file manager, share via WhatsApp, open in other apps
- **Can**: Share LINK (not file) to WhatsApp/Facebook → Deep link

### Deep Linking Flow
```
User shares: suttro.app/sim/ohms-law
  → Recipient clicks link
    → App installed? → Opens directly to that simulation
    → App NOT installed? → Smart page: "অ্যাপ নামাও" or "ব্রাউজারে দেখো"
      → "অ্যাপ নামাও" → Play Store → Install → Auto-opens simulation (deferred deep link)
      → "ব্রাউজারে দেখো" → Works in browser (hybrid advantage)
```

→ **Full hybrid/offline/deep-linking spec**: `references/hybrid-app.md`

---

## 📄 SITE STRUCTURE (suttro.app)

| Page | Route | Purpose |
|------|-------|---------|
| হোম | `/` | Hero with live simulation demo, stats, features |
| সিমুলেশন | `/simulations` | Gallery of all simulations by subject/chapter |
| সিমুলেশন প্লেয়ার | `/sim/[slug]` | Individual simulation (canvas player) |
| ক্লাস আর্কাইভ | `/classes` | Video recordings by date/chapter |
| ক্লাস প্লেয়ার | `/class/[slug]` | Individual video (video player) |
| আমাদের সম্পর্কে | `/about` | Teacher story, EJOSB IT, mission |
| লগইন | `/login` | Phone OTP authentication |
| ড্যাশবোর্ড | `/dashboard` | Progress, bookmarks, downloads |
| প্রাইসিং | `/pricing` | Freemium plans |

### Hero Section (Homepage)
- **NOT a static image** (unlike Shikho)
- **Embedded live simulation** running in the hero area
- Example: Ohm's Law simulation with sliders → "এটাই সূত্র — নিজে চালিয়ে দেখো"
- This IS the killer differentiator from Shikho

→ **Full sitemap**: `references/sitemap-features.md`

---

## 🔧 TECH STACK

| Component | Technology | Reason |
|-----------|-----------|--------|
| Framework | Next.js 14+ (App Router) | Existing repo, SSR+SSG, PWA ready |
| Simulation | HTML5 Canvas 2D + React | PhET-proven, lightweight, mobile-friendly |
| Graphs | D3.js | Data visualization in simulations |
| Pan/Zoom | CSS transform + pointer events | Google Maps pattern, no library needed |
| Video | HLS.js + Cloudflare Stream or Bunny.net | Adaptive bitrate, CDN |
| Database | PostgreSQL (Supabase) | Auth, progress, user data |
| Cache | Redis | Session, rate limiting |
| Auth | Supabase Auth (Phone OTP) | Bangladesh-friendly, no email needed |
| Payment | bKash/Nagad API | Local payment, no card needed |
| Hosting | Coolify on Contabo VPS | Existing EJOSB IT infra |
| App Shell | Capacitor.js or WebView | Hybrid app for Play Store |
| Offline | Service Worker + encrypted IndexedDB | Netflix-style DRM |
| Deep Links | Android App Links + Universal Links | Smart redirect page |
| AI Content | Claude Code | NCTB book → simulation generation |

→ **Full tech details**: `references/tech-stack.md`

---

## 🚀 BUILD PRIORITIES

### Phase 1 — MVP (Week 1-4)
1. Extend existing `bd-virtual-science-lab` Next.js repo
2. Build simulation canvas with dot-grid, pan/zoom, hand/mouse modes
3. Create 5 Physics simulations (NCTB Class 9, Chapter 1-5)
4. Build YouTube-like player shell (inline + fullscreen)
5. Landing page with live hero simulation
6. Deploy to Coolify on Contabo VPS

### Phase 2 — Video + Auth (Week 5-8)
7. Video player with HLS streaming
8. Daily class recording upload system
9. Phone OTP authentication (Supabase)
10. User dashboard with progress tracking
11. PWA setup (installable, offline shell)

### Phase 3 — App + Monetization (Month 3-4)
12. Android WebView app → Play Store
13. Deep linking + smart redirect
14. Offline download with encrypted storage
15. bKash/Nagad payment integration
16. Freemium model (some free, rest paid)

### Phase 4 — Scale (Month 5+)
17. Chemistry + Biology simulations
18. AI-powered simulation generation (Claude Code pipeline)
19. iOS app
20. Student community features

---

## 🎯 COMPETITIVE POSITIONING

| Feature | Shikho | PhET | সূত্র |
|---------|--------|------|-------|
| Interactive Simulation | ❌ Video only | ✅ Full sim | ✅ Full sim |
| Bangladesh Curriculum | ✅ NCTB aligned | ❌ Generic | ✅ NCTB chapter-mapped |
| বাংলা Interface | ✅ Full | ⚠️ Partial | ✅ Full |
| Daily Class Recording | ❌ | ❌ | ✅ Unique |
| Canvas Pan/Zoom | ❌ | ❌ | ✅ Unique |
| Mobile-First | ✅ | ⚠️ | ✅ PWA + App |
| Offline Download | ❌ | ⚠️ | ✅ Encrypted |
| Price | Paid | Free | Freemium |

**সূত্র-র moat**: NCTB-aligned simulations + 10 years teaching experience embedded in design + AI-powered content pipeline. Shikho has $6.5M funding but no simulations. PhET has simulations but no NCTB alignment or বাংলা-first design.

---

## 📋 PRE-BUILD CHECKLIST
Before starting any development:
- [ ] Domain `suttro.app` purchased
- [ ] `@suttroapp` handles claimed on all platforms
- [ ] GitHub repo: `github.com/shaaoonn/SuttroApp` ready
- [ ] Coolify + Contabo VPS accessible
- [ ] Supabase project created
- [ ] NCTB Class 9 Physics book chapters listed
- [ ] Simulation template (`_template/`) created and tested

---

## 📊 PROGRESS TRACKER
<!-- Claude Code: আপডেট করো প্রতিটি session-এর পর -->

### Phase 1 — MVP Foundation
| # | Task | Status | Date | Notes |
|---|------|--------|------|-------|
| 1.1 | Next.js project setup (SuttroApp repo) | ✅ Done | 2026-04-02 | Next.js 16.2 + Tailwind v4 + TypeScript |
| 1.2 | Brand tokens + fonts + Tailwind config | ✅ Done | 2026-04-02 | CSS variables, 4 Google Fonts, subject colors |
| 1.3 | Empty simulation player template (`_template/`) | ✅ Done | 2026-04-02 | Full player shell with toolbar, pan/zoom, modes |
| 1.4 | Player shell (topbar + bottombar + fullscreen) | ✅ Done | 2026-04-02 | PlayerShell + BottomToolbar shared components |
| 1.5 | Dot grid canvas background | ✅ Done | 2026-04-02 | DotGridCanvas component, CSS radial-gradient |
| 1.6 | Pan/zoom (hand mode) implementation | ✅ Done | 2026-04-02 | PanZoomContainer + usePanZoom hook, CSS transform |
| 1.7 | Mouse mode (object interaction) | ✅ Done | 2026-04-02 | SimObject with mode-aware drag, selection, labels |
| 1.8 | Floating control panel component | ✅ Done | 2026-04-02 | ControlPanel — slot-based variable sliders |
| 1.9 | Readout panel component | ✅ Done | 2026-04-02 | ReadoutPanel + FormulaDisplay components |
| 1.10 | Fit-to-screen button | ✅ Done | 2026-04-02 | fitToScreen in BottomToolbar, resets pan/zoom |

### Phase 1B — First Simulations
| # | Task | Status | Date | Notes |
|---|------|--------|------|-------|
| 1B.1 | Ohm's Law simulation (flagship) | ✅ Done | 2026-04-02 | Circuit with Battery, Resistor, Bulb, Ammeter, ElectronFlow |
| 1B.2 | Light Reflection simulation | ⬜ Pending | — | — |
| 1B.3 | Newton's Laws simulation | ⬜ Pending | — | — |
| 1B.4 | Wave Properties simulation | ⬜ Pending | — | — |
| 1B.5 | Circuit Builder simulation | ⬜ Pending | — | — |

### Phase 1C — Website
| # | Task | Status | Date | Notes |
|---|------|--------|------|-------|
| 1C.1 | Landing page with hero simulation | ✅ Done | 2026-04-03 | Hero with live OhmsLaw sim, stats, features, gallery, CTA |
| 1C.2 | Simulation gallery page | ✅ Done | 2026-04-03 | Subject filter tabs, SimulationCard component |
| 1C.3 | Individual simulation page | ✅ Done | 2026-04-03 | Breadcrumb, sidebar, formulas, variables, share/NCTB ref |
| 1C.4 | Responsive navigation | ✅ Done | 2026-04-03 | Navbar with subject dropdown, MobileMenu, Footer (4-col) |
| 1C.4a | About page | ✅ Done | 2026-04-03 | Mission, teacher story, EJOSB IT, vision sections |
| 1C.4b | Pricing page | ✅ Done | 2026-04-03 | Free + Premium (৳299/mo) plan cards |
| 1C.4c | Classes page | ✅ Done | 2026-04-03 | Placeholder "coming soon" for HLS video archive |
| 1C.4d | Login page | ✅ Done | 2026-04-03 | Phone OTP UI with +880 prefix |
| 1C.4e | Dashboard page | ✅ Done | 2026-04-03 | Stats, recent activity, offline downloads section |
| 1C.4f | Class player page | ✅ Done | 2026-04-03 | /class/[slug] with video placeholder, breadcrumb |
| 1C.4g | Custom 404 page | ✅ Done | 2026-04-03 | Bangla "৪০৪ পেজ পাওয়া যায়নি" |
| 1C.5 | Dockerfile + docker-compose | ✅ Done | 2026-04-03 | Multi-stage build, standalone output, .dockerignore |
| 1C.6 | PWA setup | ✅ Done | 2026-04-03 | manifest.json, service worker, PWARegister component |
| 1C.7 | Deploy to Coolify | ⬜ Pending | — | Needs Contabo VPS access |

### Phase 2 — Video + Auth
| # | Task | Status | Date | Notes |
|---|------|--------|------|-------|
| 2.1 | Video player (HLS) | ✅ Done | 2026-04-03 | VideoPlayer component with HLS.js, speed control, progress bar, fullscreen |
| 2.2 | Class archive page | ✅ Done | 2026-04-03 | Subject filters, class recording cards with thumbnails, "শীঘ্রই আসছে" |
| 2.3 | Phone OTP auth (Supabase) | ✅ Done | 2026-04-03 | AuthProvider context, lazy Supabase init, login OTP flow, auth-aware Navbar |
| 2.4 | User dashboard | ✅ Done | 2026-04-03 | Protected route, stats, recent activity, offline downloads, sign out |
| 2.5 | PWA enhancements | ⬜ Pending | — | Offline sim caching, install prompt |

### Simulation Registry
<!-- Claude Code: নতুন সিমুলেশন তৈরি হলে এখানে যোগ করো -->
| Slug | Subject | Chapter | Class | Status |
|------|---------|---------|-------|--------|
| _template | — | — | — | ✅ Template created |
| ohms-law | Physics | Ch.11 | 9 | ✅ Done |

<!-- Status symbols: ⬜ Pending | 🔄 In Progress | ✅ Done | ❌ Blocked -->
