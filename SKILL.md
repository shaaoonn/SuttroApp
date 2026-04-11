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

### Colors (CSS Variables — v2.0 Light Teal Gradient)
```css
--suttro-deep: #134E4A;        /* headers, dark bg, footer */
--suttro-primary: #0D9488;     /* buttons, links, brand teal */
--suttro-primary-bright: #14B8A6; /* gradient end, hover */
--suttro-text: #134E4A;        /* body text */
--suttro-muted: #94A3B8;       /* secondary text */
--suttro-border: #F0F4F3;      /* card borders */
--suttro-sky: #F0FDFA;         /* light backgrounds */
--suttro-surface: #F8FAFB;     /* page background */
--suttro-white: #FFFFFF;       /* card backgrounds */
--suttro-amber: #F59E0B;       /* highlights, streaks */

/* Subject-specific colors */
--physics: #3B82F6;   /* Blue */
--chemistry: #7C3AED; /* Vivid Purple */
--biology: #EC4899;   /* Pink */
--subject-math: #DC2626;        /* Red — সাধারণ গণিত */
--subject-higher-math: #EA580C; /* Orange — উচ্চতর গণিত */
--subject-english: #0891B2;     /* Cyan/Teal — ইংরেজি */
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
┌──────────────────────────────────────────────────────────────────────┐
│                     suttro.app (Next.js 16 PWA)                       │
│                                                                       │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐  │
│  │ Simulation Engine │ │  Video Player    │ │ Exam & Practice      │  │
│  │ Canvas + React    │ │  HLS + YouTube   │ │ MCQ + CQ + SRS       │  │
│  │ Dot-grid, pan/zoom│ │  PlayerShell     │ │ Auto-grading         │  │
│  └──────────────────┘ └──────────────────┘ └──────────────────────┘  │
│                                                                       │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Auth     │ │ Gamify   │ │ Payment│ │ Guide    │ │ Daily       │  │
│  │ OTP +   │ │ XP,Badge │ │ bKash  │ │ Chapter  │ │ Lessons     │  │
│  │ Google   │ │ Leader   │ │        │ │ Mastery  │ │ Class 9/10  │  │
│  └──────────┘ └──────────┘ └────────┘ └──────────┘ └─────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  CMS API (Dynamic site content, /api/site-content)            │   │
│  │  + Google Sheets sync + Admin Panel (admin.suttro.app)        │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Self-hosted Supabase) + Coolify + Contabo VPS    │   │
│  │  Kong API Gateway at api.suttro.app                           │   │
│  └────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
        ▲               ▲               ▲
        │               │               │
   ┌────┴────┐   ┌──────┴──────┐  ┌─────┴──────────────────────────┐
   │ Desktop │   │ Mobile      │  │  Android App (Capacitor 8.x)   │
   │ Browser │   │ Browser     │  │  WebView → suttro.app          │
   │ (PWA)   │   │ (Responsive)│  │  Play Store (signed AAB/APK)   │
   └─────────┘   └─────────────┘  └────────────────────────────────┘
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
| হোম | `/` | Hero with live simulation, stats, features (Desktop/Mobile variants) |
| গাইড | `/guide` | Study guide — chapter content, mastery tracker, practice |
| পরীক্ষা | `/exams` | MCQ exam list by subject, class filter |
| পরীক্ষা প্লেয়ার | `/exam/[slug]` | Exam attempt — auto-grading, results, CQ viewer |
| সিমুলেশন | `/simulations` | Gallery of all simulations by subject/chapter |
| সিমুলেশন প্লেয়ার | `/sim/[slug]` | Individual simulation (canvas player) |
| ক্লাস আর্কাইভ | `/classes` | Video recordings with subject filter |
| ক্লাস প্লেয়ার | `/class/[slug]` | Video player (HLS + YouTube) |
| আজকের পড়া | `/daily` | Daily lesson — class 9/10 filtered |
| অনুশীলন | `/practice` | Practice mode with SRS |
| রিভিউ | `/review` | Review past content |
| ড্যাশবোর্ড | `/dashboard` | Stats, XP, recent activity, progress |
| প্রোফাইল | `/profile` | Edit name, class level, account settings |
| অ্যাচিভমেন্ট | `/achievements` | Badges and milestones |
| লিডারবোর্ড | `/leaderboard` | Rankings by XP |
| লগইন | `/login` | Phone OTP + Google OAuth |
| অনবোর্ডিং | `/onboarding` | First-time setup — class selection + name |
| প্রাইসিং | `/pricing` | Free + Premium plans, donate option |
| পেমেন্ট | `/payment` | bKash payment flow (success/failed pages) |
| গোপনীয়তা নীতি | `/privacy` | Privacy policy (Bengali + English) |
| শর্তাবলী | `/terms` | Terms of service (Bengali + English) |
| আমাদের সম্পর্কে | `/about` | Teacher story, EJOSB IT, mission |

### Admin Panel (Separate Next.js app at `/admin/`)
| Feature | Route | Notes |
|---------|-------|-------|
| Analytics | `/admin/analytics` | Charts, user metrics |
| Users | `/admin/users` | User management CRUD |
| Exams | `/admin/exams` | Create/edit MCQ exams |
| CQ | `/admin/cq` | Creative questions editor |
| Daily Lessons | `/admin/daily-lessons` | Manage daily content + reviews |
| Classes | `/admin/classes` | Video class CRUD |
| Plans | `/admin/plans` | Subscription plan management |
| Content | `/admin/content` | Dynamic site content CMS |
| CSV Import | `/admin/questions/import` | Bulk question import |

### Hero Section (Homepage)
- **NOT a static image** (unlike Shikho)
- **Embedded live simulation** running in the hero area
- Example: Ohm's Law simulation with sliders → "এটাই সূত্র — নিজে চালিয়ে দেখো"
- This IS the killer differentiator from Shikho

→ **Full sitemap**: `references/sitemap-features.md`

---

## 🔧 TECH STACK

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | Next.js (App Router) | 16.2 | React 19, static export for Capacitor |
| Styling | Tailwind CSS | v4 | PostCSS, CSS variables |
| Simulation | HTML5 Canvas 2D + React | — | PhET-proven, lightweight |
| Pan/Zoom | CSS transform + pointer events | — | Google Maps pattern |
| Video | HLS.js + YouTube embed | 1.6 | PlayerShell shared with sim player |
| Database | PostgreSQL (Self-hosted Supabase) | — | Kong at api.suttro.app |
| Auth | Supabase Auth (Phone OTP + Google OAuth) | — | Auth gate in Capacitor app |
| Payment | bKash API | — | Initiate + callback flow |
| Hosting | Coolify on Contabo VPS | — | Docker, auto-deploy on push |
| Mobile App | Capacitor | 8.3 | Server URL mode → suttro.app in WebView |
| Admin Panel | Next.js (separate app) | 16.2 | Separate Dockerfile |
| Data Sync | Google Sheets API + Google Drive | — | Profile sync, content upload |
| Gamification | Custom (XP, badges, SRS, leaderboard) | — | 22 API routes |
| CMS | Custom API + admin panel | — | Dynamic site content |
| AI Content | Claude Code | — | NCTB book → simulation generation |

→ **Full tech details**: `references/tech-stack.md`

---

## 🚀 BUILD PHASES (Updated)

### Phase 1 — MVP Foundation ✅ COMPLETE
Simulation engine, website, canvas player, first simulations, deploy to Coolify

### Phase 2 — Content + Auth + Gamification ✅ COMPLETE
Video player, phone OTP + Google OAuth, exam system, guide, daily lessons,
practice mode, XP, badges, leaderboard, SRS, bKash payment

### Phase 2.5 — CMS + Admin + Branding ✅ COMPLETE
Admin panel (separate Next.js), dynamic CMS, Google Sheets sync,
Design v2.0 light teal redesign, new brand logo

### Phase 3 — Android App + Play Store ✅ COMPLETE
Capacitor 8.x WebView app, auth gate, onboarding, privacy policy,
terms of service, signed AAB/APK builds, new app icons

### Phase 4 — Scale (NEXT)
- Chemistry + Biology simulations
- AI-powered simulation generation (Claude Code pipeline)
- iOS app
- Offline downloads with encrypted storage
- Deep linking + smart redirect
- Student community features

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

### Phase 1 — MVP Foundation ✅
| # | Task | Status | Date | Notes |
|---|------|--------|------|-------|
| 1.1 | Next.js project setup | ✅ | 2026-04-02 | Next.js 16.2 + Tailwind v4 + TypeScript |
| 1.2 | Brand tokens + fonts + Tailwind config | ✅ | 2026-04-02 | CSS variables, 4 Google Fonts, subject colors |
| 1.3 | Simulation template (`_template/`) | ✅ | 2026-04-02 | Full player shell with toolbar, pan/zoom, modes |
| 1.4 | Player shell (topbar + bottombar + fullscreen) | ✅ | 2026-04-02 | PlayerShell + BottomToolbar shared components |
| 1.5 | Dot grid + Pan/zoom + Mouse mode + Controls | ✅ | 2026-04-02 | DotGridCanvas, PanZoomContainer, SimObject, ControlPanel, ReadoutPanel |
| 1.6 | Ohm's Law simulation (flagship) | ✅ | 2026-04-02 | Battery, Resistor, Bulb, Ammeter, ElectronFlow |
| 1.7 | Light Reflection + Refraction simulations | ✅ | 2026-04-03 | Mirror, rays, θᵢ=θᵣ, Snell's law |
| 1.8 | Website — all pages + navigation | ✅ | 2026-04-03 | Home, simulations, classes, about, pricing, login, dashboard, 404 |
| 1.9 | Docker + PWA + Deploy to Coolify | ✅ | 2026-04-03 | Multi-stage build, manifest.json, auto-deploy |

### Phase 2 — Content + Auth + Gamification ✅
| # | Task | Status | Date | Notes |
|---|------|--------|------|-------|
| 2.1 | Video player (HLS + YouTube) | ✅ | 2026-04-03 | HLS.js, speed control, progress bar, fullscreen, YouTubePlayer |
| 2.2 | Phone OTP auth (Supabase) | ✅ | 2026-04-03 | AuthProvider, lazy init, OTP flow |
| 2.3 | Google OAuth | ✅ | 2026-04-10 | signInWithOAuth, redirect handling |
| 2.4 | Profile API (GET/PATCH) | ✅ | 2026-04-10 | Auto-create on first login, service-role key |
| 2.5 | Exam system | ✅ | 2026-04-10 | ExamPlayer, ExamResult, ExamFilter, ExamTabs, CQViewer, CQFilter |
| 2.6 | Guide / Chapter system | ✅ | 2026-04-10 | ChapterContentView, ChapterMastery, PracticeButton |
| 2.7 | Daily lesson system | ✅ | 2026-04-10 | Daily challenge + scoring, class 9/10 filter |
| 2.8 | Practice mode + SRS | ✅ | 2026-04-10 | Spaced repetition algorithm, practice sessions |
| 2.9 | XP system | ✅ | 2026-04-10 | XP earning, tracking, lib/xp.ts |
| 2.10 | Badge/Achievement system | ✅ | 2026-04-10 | lib/badges.ts, /api/badges, /achievements page |
| 2.11 | Leaderboard | ✅ | 2026-04-10 | /api/leaderboard, /leaderboard page |
| 2.12 | bKash payment integration | ✅ | 2026-04-10 | /api/payment/bkash — initiate + callback |
| 2.13 | Subscription plans | ✅ | 2026-04-10 | /api/plans, /api/subscription, admin plan manager |
| 2.14 | Google Sheets sync | ✅ | 2026-04-10 | Profile sync to Google Sheets on user create/update |
| 2.15 | Content tracker / Analytics | ✅ | 2026-04-10 | ContentTracker component, /api/track |
| 2.16 | TTS (Text-to-speech) | ✅ | 2026-04-10 | /api/tts for audio content |

### Phase 2.5A — CMS + Admin Panel ✅
| # | Task | Status | Date | Notes |
|---|------|--------|------|-------|
| A.1 | Admin panel (separate Next.js app) | ✅ | 2026-04-10 | `/admin/` — own Dockerfile, node_modules, .env |
| A.2 | Dynamic site content CMS | ✅ | 2026-04-10 | /api/site-content + admin/content editor |
| A.3 | Exams CRUD (admin) | ✅ | 2026-04-10 | admin/exams — create, edit, list |
| A.4 | CQ editor (admin) | ✅ | 2026-04-10 | admin/cq — creative questions collections |
| A.5 | Daily lessons manager (admin) | ✅ | 2026-04-10 | admin/daily-lessons — CRUD + reviews |
| A.6 | Classes manager (admin) | ✅ | 2026-04-10 | admin/classes — video class CRUD |
| A.7 | Users manager (admin) | ✅ | 2026-04-10 | admin/users — list, view profiles |
| A.8 | Plans manager (admin) | ✅ | 2026-04-10 | admin/plans — subscription plan config |
| A.9 | Analytics dashboard (admin) | ✅ | 2026-04-10 | admin/analytics — charts |
| A.10 | CSV question import | ✅ | 2026-04-10 | admin/questions/import — bulk upload |
| A.11 | CMS live update fix | ✅ | 2026-04-10 | /api/revalidate ISR cache invalidation |

### Phase 2.5B — Design v2.0 + Branding ✅
| # | Task | Status | Date | Notes |
|---|------|--------|------|-------|
| D.1 | Light Teal Gradient redesign | ✅ | 2026-04-10 | Full palette swap — all pages updated |
| D.2 | New brand logo (সূত্র stylized) | ✅ | 2026-04-10 | Logo with orange wave, web + icons generated |
| D.3 | Subject colors update | ✅ | 2026-04-10 | Bio #EC4899, Physics #3B82F6, Chem #7C3AED |
| D.4 | Mobile layout (AppBar + BottomNav) | ✅ | 2026-04-10 | 4-tab nav: হোম, শেখো, পরীক্ষা, আমি |
| D.5 | Desktop/Mobile home variants | ✅ | 2026-04-10 | DesktopHome + MobileHome components |

### Phase 3 — Android App + Play Store ✅
| # | Task | Status | Date | Notes |
|---|------|--------|------|-------|
| 3.1 | Capacitor 8.x setup | ✅ | 2026-04-11 | Server URL mode → suttro.app in WebView |
| 3.2 | Android signing keystore | ✅ | 2026-04-11 | CN=Suttro, O=Suttro, L=Dhaka, C=BD |
| 3.3 | Build config (R8, ProGuard, splits) | ✅ | 2026-04-11 | minify + shrink, 64-bit NDK, proguard-optimize |
| 3.4 | Network security config | ✅ | 2026-04-11 | HTTPS-only + sslip.io cleartext for self-hosted Supabase |
| 3.5 | OAuth in-app fix | ✅ | 2026-04-11 | skipBrowserRedirect + manual navigate → stays in WebView |
| 3.6 | Keyboard scroll fix | ✅ | 2026-04-11 | Keyboard.resize: 'body' + resizeOnFullScreen |
| 3.7 | Auth gate (force login in app) | ✅ | 2026-04-11 | AuthGate component, detects SuttroApp user-agent |
| 3.8 | Loading/splash screen | ✅ | 2026-04-11 | Capacitor splash (2s) + AuthGate loading (logo + dots) |
| 3.9 | Onboarding page | ✅ | 2026-04-11 | Class 9/10 selection + name input, Google auto-fill |
| 3.10 | Privacy policy page | ✅ | 2026-04-11 | Bengali + English summary, Play Store ready |
| 3.11 | Terms of service page | ✅ | 2026-04-11 | Bengali + English summary |
| 3.12 | Android icons (new logo) | ✅ | 2026-04-11 | All mipmap densities + adaptive icon foreground |
| 3.13 | Android splash (new logo) | ✅ | 2026-04-11 | splash.png + brand color #F0FDFA |
| 3.14 | allowNavigation for OAuth | ✅ | 2026-04-11 | Google, gstatic, sslip.io, bKash, Supabase domains |
| 3.15 | AAB build (Play Store) | ✅ | 2026-04-11 | releases/suttro-v1.1.0.aab (4.0 MB) |
| 3.16 | APK build (sideload) | ✅ | 2026-04-11 | releases/suttro-v1.1.0.apk (3.1 MB) |

### Recent Fixes
| # | Fix | Date | Commit |
|---|-----|------|--------|
| F.1 | Docker Node.js memory limit (VPS OOM) | 2026-04-10 | `559f332` |
| F.2 | CMS live update (revalidation) | 2026-04-10 | `db0a440` |
| F.3 | Class 9/10 daily lesson filter | 2026-04-10 | `db0a440` |
| F.4 | Donate option on pricing page | 2026-04-10 | `db0a440` |
| F.5 | Profile save RLS bypass | 2026-04-10 | `0edf417` |
| F.6 | BottomNav hide on login/onboarding | 2026-04-11 | `4872c97` |
| F.7 | AppBar hide on login/onboarding | 2026-04-11 | `4872c97` |

### Phase 4 — Scale (NEXT)
| # | Task | Status | Notes |
|---|------|--------|-------|
| 4.1 | Newton's Laws simulation | ⬜ Pending | — |
| 4.2 | Wave Properties simulation | ⬜ Pending | — |
| 4.3 | Circuit Builder simulation | ⬜ Pending | — |
| 4.4 | Chemistry simulations | ⬜ Pending | — |
| 4.5 | Biology simulations | ⬜ Pending | — |
| 4.6 | AI simulation generation pipeline | ⬜ Pending | Claude Code NCTB→sim |
| 4.7 | Offline downloads (encrypted) | ⬜ Pending | Netflix-style DRM |
| 4.8 | Deep linking + smart redirect | ⬜ Pending | App Links |
| 4.9 | iOS app | ⬜ Pending | WKWebView via Capacitor |
| 4.10 | PWA enhancements | ⬜ Pending | Offline caching, install prompt |

### Simulation Registry
<!-- Claude Code: নতুন সিমুলেশন তৈরি হলে এখানে যোগ করো -->
| Slug | Subject | Chapter | Class | Status |
|------|---------|---------|-------|--------|
| _template | — | — | — | ✅ Template |
| ohms-law | Physics | Ch.11 | 9 | ✅ Done |
| light-reflection | Physics | Ch.10 | 9 | ✅ Done |
| light-refraction | Physics | Ch.10 | 9 | ✅ Done |

### API Routes Summary (22 endpoints)
```
/api/admin          /api/badges         /api/chapter-progress
/api/daily-challenge /api/daily-lesson   /api/dashboard
/api/exam-attempt   /api/leaderboard    /api/payment (bkash/)
/api/plans          /api/practice       /api/profile
/api/revalidate     /api/sheets         /api/site-content
/api/srs            /api/subscription   /api/track
/api/tts            /api/upload         /api/xp
```

### Key Files Quick Reference
```
src/lib/auth-context.tsx   — Auth state (OTP + Google OAuth)
src/lib/xp.ts              — XP progression logic
src/lib/badges.ts          — Achievement system
src/lib/srs.ts             — Spaced Repetition algorithm
src/lib/bkash.ts           — bKash payment gateway
src/lib/subscription.ts    — Subscription/plan logic
src/lib/site-content.ts    — CMS content fetching
src/lib/google-sheets.ts   — Google Sheets API sync
src/lib/google-drive.ts    — Google Drive integration
src/components/AuthGate.tsx — Auth gate + loading screen
capacitor.config.ts        — Android app config
android/app/build.gradle   — Android signing + build
```

### Android Build Commands
```bash
# Environment (Windows)
export JAVA_HOME="C:/Users/Ahsanullah Shaon/.jdk/jdk-21.0.10+7"
export ANDROID_SDK_ROOT="C:/Users/Ahsanullah Shaon/.android-sdk"
export _JAVA_OPTIONS="-Djava.net.preferIPv4Stack=true -Djdk.net.unixdomain.tmpdir=C:/tmp"

# Sync + Build
npx cap sync android
cd android && ./gradlew bundleRelease assembleRelease --no-daemon

# Output
releases/suttro-v1.1.0.aab  (Play Store)
releases/suttro-v1.1.0.apk  (Sideload/Testing)

# Verify signing
java -jar $ANDROID_SDK_ROOT/build-tools/35.0.0/lib/apksigner.jar verify --print-certs releases/suttro-v1.1.0.apk
```

<!-- Status symbols: ⬜ Pending | 🔄 In Progress | ✅ Done | ❌ Blocked -->
