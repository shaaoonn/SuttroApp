# সূত্র — Sitemap & Features

## Page Structure

### Navigation Bar
```
[সূত্র Logo]  বিষয়▾  সিমুলেশন  ক্লাস আর্কাইভ  আমাদের সম্পর্কে  [লগ ইন]
```

"বিষয়" dropdown:
- পদার্থবিজ্ঞান (Physics) — #2563EB tag
- রসায়ন (Chemistry) — #7C3AED tag
- জীববিজ্ঞান (Biology) — #059669 tag

Mobile: Hamburger menu (☰)

---

## Pages

### 1. হোম (/)
**Hero Section — LIVE SIMULATION (NOT a static image)**
Unlike Shikho which uses a 3D-rendered student image, সূত্র's hero contains
an actual running simulation (e.g., Ohm's Law) that visitors can interact with.

```
Layout:
┌──────────────────────────────────────────────────┐
│  [Nav Bar]                                        │
├──────────────────────────────────────────────────┤
│                                                   │
│  বিজ্ঞান দেখো, বিজ্ঞান বোঝো।                     │
│  ক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স সিমুলেশন         │
│                                                   │
│  [সিমুলেশন চালাও →]  [ক্লাস দেখো ▶]               │
│                                                   │
│  ┌─────────────────────────────────────┐          │
│  │  ◉ LIVE SIMULATION PLAYER           │          │
│  │  (Ohm's Law — interactive)          │          │
│  │  Sliders, readouts, canvas          │          │
│  └─────────────────────────────────────┘          │
│                                                   │
├──────────────────────────────────────────────────┤
│  Stats Bar:                                       │
│  [X+ সিমুলেশন]  [X+ ক্লাস]  [X+ শিক্ষার্থী]       │
├──────────────────────────────────────────────────┤
│  Feature Section:                                 │
│  • ইন্টারেক্টিভ সিমুলেশন                           │
│  • ডেইলি ক্লাস রেকর্ডিং                            │
│  • NCTB চ্যাপ্টার-ম্যাপড                           │
│  • অফলাইন ডাউনলোড                                │
├──────────────────────────────────────────────────┤
│  Simulation Gallery Preview (3-4 featured sims)   │
├──────────────────────────────────────────────────┤
│  Trust Section:                                   │
│  • ১০ বছরের অভিজ্ঞতা                              │
│  • YouTube channel embed                          │
│  • Student testimonials                           │
├──────────────────────────────────────────────────┤
│  CTA: অ্যাপ ডাউনলোড করো / ফ্রি ট্রায়াল           │
├──────────────────────────────────────────────────┤
│  Footer                                           │
└──────────────────────────────────────────────────┘
```

### 2. সিমুলেশন গ্যালারি (/simulations)
```
Filters: [সব] [পদার্থবিজ্ঞান] [রসায়ন] [জীববিজ্ঞান] | [ক্লাস ৯] [ক্লাস ১০]

Grid of simulation cards:
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ ⚡ (blue bg)   │ │ 🧪 (purple bg) │ │ 🧬 (green bg)  │
│ পদার্থ · অধ্যায় ৯│ │ রসায়ন · অধ্যায় ৩│ │ জীববিজ্ঞান · অ.৩ │
│ ওহমের সূত্র     │ │ অ্যাসিড-বেস    │ │ কোষ বিভাজন     │
│ [চালাও →]      │ │ [চালাও →]      │ │ [চালাও →]      │
└────────────────┘ └────────────────┘ └────────────────┘
```

### 3. সিমুলেশন প্লেয়ার (/sim/[slug])
```
┌──────────────────────────────────────────────────┐
│  [← ফিরে যাও]  পদার্থবিজ্ঞান > অধ্যায় ৯ > ওহমের সূত্র │
├──────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────┐ │
│  │                                             │ │
│  │        SIMULATION PLAYER (full width)       │ │
│  │        (Canvas + controls + toolbar)         │ │
│  │                                             │ │
│  └─────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│  Below player:                                   │
│  • সম্পর্কিত সূত্র: V = IR                       │
│  • NCTB বই রেফারেন্স: পৃষ্ঠা ১২৩-১২৮              │
│  • [⬇️ ডাউনলোড] [↗️ শেয়ার]                       │
│  • সম্পর্কিত ক্লাস ভিডিও (if exists)              │
│  • সম্পর্কিত সিমুলেশন (same chapter)              │
└──────────────────────────────────────────────────┘
```

### 4. ক্লাস আর্কাইভ (/classes)
```
Filters: [তারিখ অনুযায়ী] [অধ্যায় অনুযায়ী] [বিষয় অনুযায়ী]

List/Grid of class recordings:
┌──────────────────────────────────────┐
│ ▶ ০২ এপ্রিল ২০২৬ — ওহমের সূত্র      │
│   পদার্থবিজ্ঞান · অধ্যায় ৯ · ৪৫ মিনিট │
│   [দেখো →]  [⬇️]  [↗️]               │
└──────────────────────────────────────┘
```

### 5. ক্লাস প্লেয়ার (/class/[slug])
Same layout as simulation player, but with video player instead of canvas.

### 6. আমাদের সম্পর্কে (/about)
- শাওন-এর ১০ বছরের টিচিং জার্নি
- EJOSB IT ব্যাকগ্রাউন্ড
- সূত্র-র মিশন ও ভিশন
- YouTube channel showcase

### 7. লগইন (/login)
- Phone number input (Bangladesh: +880)
- OTP verification (Supabase Auth)
- No email/password needed

### 8. ড্যাশবোর্ড (/dashboard)
- সম্প্রতি দেখা সিমুলেশন
- সম্প্রতি দেখা ক্লাস
- অফলাইন ডাউনলোড ম্যানেজার
- প্রোগ্রেস ট্র্যাকার (chapter completion)
- বুকমার্ক

### 9. প্রাইসিং (/pricing)
```
[ফ্রি]              [প্রিমিয়াম]
• ৫টি সিমুলেশন       • সব সিমুলেশন
• ৫টি ক্লাস ভিডিও    • সব ক্লাস ভিডিও
• অনলাইন শুধু         • অফলাইন ডাউনলোড
                     • অগ্রাধিকার সাপোর্ট
                     [৳XXX/মাস]
```

---

## Shikho vs সূত্র — Feature Comparison

| Shikho Feature | সূত্র Equivalent | Difference |
|---------------|-----------------|------------|
| 3D student hero image | Live simulation in hero | Interactive vs static |
| Animated video lessons | Interactive simulations | Passive vs active learning |
| Live classes | Daily class recordings | Pre-recorded archive |
| MCQ tests | — | Phase 2 (not MVP) |
| Smart notes | — | Not planned |
| Report card | Progress tracker | Simpler, chapter-based |
| 30 লক্ষ+ শিক্ষার্থী | Starting fresh | Focus on quality, not quantity |
| Class 6-12 + Admission | Class 9-10 Science ONLY | Narrow & deep vs wide & shallow |
| Video-only learning | Simulation + Video combo | Unique differentiator |

---

## Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm — large phones */ }
@media (min-width: 768px)  { /* md — tablets */ }
@media (min-width: 1024px) { /* lg — laptops */ }
@media (min-width: 1280px) { /* xl — desktops */ }
```

### Mobile-Specific Adaptations
- Navigation: hamburger menu
- Hero simulation: taller aspect ratio, simplified controls
- Cards: single column
- Player: full width, bottom sheet for controls
- CTA buttons: full width, stacked vertically
