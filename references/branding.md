# সূত্র | Suttro — Complete Branding Guide

## Brand Essence

### Mission
সূত্র বাংলাদেশের শিক্ষার্থীদের জন্য বিজ্ঞানকে স্পর্শযোগ্য করে তোলে — বইয়ের স্থির ছবিকে ইন্টারেক্টিভ সিমুলেশনে রূপান্তরিত করে।

### Vision
বিজ্ঞান পড়া নয়, বিজ্ঞান করা — প্রতিটি বাংলাদেশী শিক্ষার্থী যেন ল্যাব ছাড়াই ল্যাবের অভিজ্ঞতা পায়।

### Brand Personality
সূত্র একজন **তরুণ, উৎসাহী বিজ্ঞান শিক্ষক** — জটিল জিনিসকে সহজ ও মজার করে দেখায়।
একাডেমিক কিন্তু বন্ধুসুলভ। নতুন প্রযুক্তি ব্যবহার করে কিন্তু দেখানোপনা করে না।

### We Are / We Are Not
- **আমরা**: সহজবোধ্য, ইন্টারেক্টিভ, বাংলাদেশ-কেন্দ্রিক, মোবাইল-ফার্স্ট, আনন্দদায়ক
- **আমরা নই**: জটিল, একাডেমিক ভাষায় ভারী, বিদেশী কপি, শুধু ভিডিও-নির্ভর, boring

---

## Taglines

| Context | Tagline |
|---------|---------|
| Primary | বিজ্ঞান দেখো, বিজ্ঞান বোঝো। |
| Short | ছুঁয়ে দেখো বিজ্ঞান। |
| English | See science. Understand science. |
| Closing | বিজ্ঞান পড়া নয়, বিজ্ঞান করা। |
| Teacher credential | ১০ বছরের অভিজ্ঞতা, এক ক্লিকে। |

---

## Logo System

### Wordmark Variations
| Variation | Format | Use Case |
|-----------|--------|----------|
| সূত্র + SUTTRO | Full wordmark | Website header, official docs |
| সূত্র | Bengali-only | Social media, Bengali content |
| সূ | Icon mark / favicon | App icon, favicon, small spaces |
| সূত্র \| suttro.app | Social display name | All social media profiles |

### Logo Colors by Background
- Light background → Deep (#0B1D3A) logo, Muted (#6B7280) subtitle
- Dark background → White (#FFFFFF) logo, White 50% subtitle
- Green background → White logo, White 50% subtitle

### Clear Space
Minimum clear space = height of "সূ" character on all sides.
Minimum digital width: full wordmark = 120px, icon mark = 32px.

### Logo Don'ts
- No gradients, shadows, outlines, or effects
- No tilting, bending, or partial cropping
- No non-brand colors
- No background interference (ensure contrast)

---

## Color System

### Primary Palette
```css
:root {
  --suttro-deep: #0B1D3A;          /* 60% — headers, dark bg, body text */
  --suttro-primary: #1B6B4A;       /* 25% — buttons, links, brand green */
  --suttro-primary-light: #2A9D6E; /* success states, positive feedback */
  --suttro-accent: #E8A838;        /* 10% — highlights, CTA, badges */
  --suttro-accent-light: #FFF3DB;  /* accent backgrounds */
  --suttro-sky: #E4F0F6;           /* light section backgrounds */
  --suttro-surface: #FAFBF9;       /* page background */
  --suttro-white: #FFFFFF;         /* card backgrounds */
  --suttro-text: #1A1F2B;          /* body text */
  --suttro-muted: #6B7280;         /* secondary text */
  --suttro-border: #E2E5E0;        /* borders, dividers */
  --suttro-red: #C4392D;           /* errors, warnings */
}
```

### Subject-Specific Colors
| Subject | Color | Hex | Use |
|---------|-------|-----|-----|
| পদার্থবিজ্ঞান (Physics) | Electric Blue | #2563EB | Chapter tags, sim borders |
| রসায়ন (Chemistry) | Vivid Purple | #7C3AED | Chapter tags, sim borders |
| জীববিজ্ঞান (Biology) | Emerald | #059669 | Chapter tags, sim borders |
| সাধারণ গণিত (General Math) | Red | #DC2626 | Chapter tags, sim borders |
| উচ্চতর গণিত (Higher Math) | Orange | #EA580C | Chapter tags, sim borders |
| ইংরেজি (English) | Cyan/Teal | #0891B2 | Chapter tags, sim borders |

### Color Ratio
- Deep: 60% (main backgrounds, text)
- Green: 25% (primary actions)
- Gold: 10% (accents, attention-grabbers)
- Neutral: 5% (supporting UI)

---

## Typography

### Font Stack
```css
/* Bengali — ALL Bengali text */
font-family: 'Hind Siliguri', sans-serif;
/* Weights: 400 (body), 500 (emphasis), 600 (subhead), 700 (headline) */

/* English Display — headings, hero text, decorative */
font-family: 'DM Serif Display', serif;
/* Weights: 400, 400 italic */

/* English Body — UI text, descriptions */
font-family: 'DM Sans', sans-serif;
/* Weights: 400, 500, 600, 700 */

/* Code/Data — formulas, measurements, code, labels */
font-family: 'JetBrains Mono', monospace;
/* Weights: 400, 500 */
```

### Type Scale
```
H1: 36px / font-weight: 700 / line-height: 1.2
H2: 28px / font-weight: 600 / line-height: 1.3
H3: 22px / font-weight: 600 / line-height: 1.4
H4: 18px / font-weight: 500 / line-height: 1.5
Body: 16px / font-weight: 400 / line-height: 1.7
Small: 14px / font-weight: 400 / line-height: 1.6
Caption: 12px / font-weight: 400 / JetBrains Mono
```

---

## Voice & Tone

### Pronoun Guide
| Audience | Pronoun |
|----------|---------|
| Students | "তুমি" / "তোমার" |
| About us | "আমরা" / "সূত্র" |
| Parents | "আপনি" / "আপনার" |
| Never use | "ইউজার", "ক্লায়েন্ট" |

### Voice Attributes
- **সহজ**: জটিল ভাষা এড়াও
- **উৎসাহী**: বিজ্ঞান exciting, সেটা দেখাও
- **সরাসরি**: ঘোরাফেরা করো না
- **সমর্থনকারী**: "পারবে না" কখনো বলো না

### Copy Examples
| Context | ✅ Do | ❌ Don't |
|---------|-------|---------|
| Simulation CTA | সিমুলেশন চালাও → | সিমুলেশন অভিজ্ঞতা শুরু করুন |
| Explanation | রেজিস্ট্যান্স বাড়াও — দেখো কারেন্ট কমে যাচ্ছে! | রোধ ও তড়িৎ প্রবাহের মধ্যে ব্যস্তানুপাতিক সম্পর্ক বিদ্যমান |
| Error | ওহো! কিছু একটা ঠিক হয়নি। আবার চেষ্টা করো? | Error 500: Internal Server Error |
| Empty state | এখনো কোনো সিমুলেশন চালাওনি — শুরু করো! | No data available |

---

## UI Components

### Buttons
```
Primary CTA:  bg=#1B6B4A, color=white, radius=10px, font=Hind Siliguri 600
Secondary:    bg=transparent, border=1.5px #1B6B4A, color=#1B6B4A, radius=10px
Special/Offer: bg=#E8A838, color=#0B1D3A, radius=10px
Ghost:        bg=#FAFBF9, border=1px #E2E5E0, color=#6B7280, radius=10px
```

### Border Radius System
- Icon: 6px
- Button: 10px
- Card: 14px
- Modal/Dialog: 20px

### Spacing Scale (4px base)
4, 8, 12, 16, 24, 32, 48, 64px
- Component internal: 8-16px
- Between components: 16-24px
- Between sections: 48-64px
- Max content width: 860px

---

## Social Media

### Profile Setup (ALL platforms)
- **Display Name**: সূত্র | suttro.app
- **Handle**: @suttroapp
- **Avatar**: Green (#1B6B4A) background, white "সূ" text
- **Cover**: Simulation screenshot + tagline
- **Bio**: বিজ্ঞান দেখো, বিজ্ঞান বোঝো। 🔬\nক্লাস ৯-১০ ইন্টারেক্টিভ সায়েন্স সিমুলেশন\n🔗 suttro.app

### Content Pillars
| Type | % | Example |
|------|---|---------|
| সিমুলেশন ডেমো | 40% | Screen recordings, "এটা ট্রাই করো" posts |
| পরীক্ষার টিপস | 25% | MCQ shortcuts, memory techniques |
| মজার বিজ্ঞান | 20% | "তুমি কি জানো?" facts |
| স্টুডেন্ট স্টোরি | 15% | Results, feedback, success stories |

---

## Imagery Guidelines

### Do
- Real simulation screenshots (product IS the marketing)
- Real Bangladeshi student photos (with permission)
- Flat-style diagrams in brand colors
- Natural lighting, warm tone

### Don't
- Generic stock photos (smiling students with laptops)
- AI-generated people
- 3D renders or glossy illustrations
- Complex infographics

### Photography Style
- **Lighting**: Natural, bright but not harsh
- **Color grading**: Slightly warm, green/gold undertones
- **Subject**: Close-up hands/screen, wide classroom/students
- **Mood**: Curious, focused, joyful — never bored

---

## Motion & Animation

### Duration
- Micro (hover, click): 150-200ms
- Transition (page, modal): 300-400ms
- Simulation: Real-time (requestAnimationFrame, 60fps)

### Easing
```css
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

### Entry Animations
- `fade-in` + `translateY(8px)` — never bounce or elastic
- No parallax or scroll hijacking

---

## Accessibility

- All text: minimum WCAG AA (4.5:1) contrast ratio
- Important info in simulations: shape/label in addition to color (color-blind safe)
- Mobile touch targets: minimum 44×44px
- Simulation sliders: large, clear, thumb ≥ 44px
