# সূত্র | Suttro — Branding Guide v2.0 — Light Teal + Gradient + Clean

## COLOR SYSTEM

### Primary — Teal
--suttro-primary: #0D9488;
--suttro-primary-light: #14B8A6;
--suttro-primary-bright: #2DD4BF;
--suttro-primary-text: #134E4A;
--suttro-primary-bg: #F0FDFA;
--suttro-primary-border: #CCFBF1;
--suttro-primary-shadow: rgba(13,148,136,0.25);

### Amber — Video, CTA, Streak
--suttro-amber: #F59E0B;
--suttro-amber-light: #FBBF24;
--suttro-amber-text: #92400E;
--suttro-amber-bg: #FFFBEB;
--suttro-amber-border: #FDE68A;

### Subject Colors
Physics: #3B82F6, light #60A5FA, text #1E40AF, bg #EFF6FF, border #BFDBFE
Chemistry: #7C3AED, light #A78BFA, text #5B21B6, bg #F5F3FF, border #DDD6FE
Biology: #EC4899, light #F472B6, text #9D174D, bg #FDF2F8, border #FBCFE8

### Surface
--suttro-bg: #F8FAFB;
--suttro-card: #FFFFFF;
--suttro-text: #134E4A;
--suttro-text-secondary: #5F9EA0;
--suttro-text-muted: #94A3B8;
--suttro-border: #F0F4F3;

### Simulation Canvas (NEVER CHANGE)
--sim-bg: #0d1117;

## GRADIENTS
Hero bg: linear-gradient(160deg, #F0FDFA 0%, #F5F3FF 50%, #FEF3C7 100%)
Primary button: linear-gradient(135deg, #0D9488, #14B8A6) + box-shadow 0 4px 14px rgba(13,148,136,0.25)
Subject icons: each subject's own gradient + box-shadow 0 3px 10px rgba(color,0.2)
Amber accent: linear-gradient(135deg, #F59E0B, #FBBF24)
Progress bar: linear-gradient(90deg, #0D9488, #2DD4BF)
Gradient শুধু buttons, icons, progress bars, hero bg-তে। Cards ও text-এ gradient নেই।

## CARDS
Default: bg white, border 1px solid #F0F4F3, radius 12px
Subject card: bg white, border 1px solid [subject-border], radius 12px
Notification: bg linear-gradient(135deg, #FFFBEB, #FEF3C7), border 1px solid #FDE68A

## BUTTONS
Primary: gradient(135deg, #0D9488, #14B8A6), white text, radius 12px, shadow
Secondary: bg white, color #0D9488, border 1.5px solid #99F6E4, radius 12px
Amber CTA: gradient(135deg, #F59E0B, #FBBF24), white text, radius 12px, shadow

## RULES
- Simulation canvas dark theme (#0d1117) কখনো পরিবর্তন করো না
- Cards সবসময় white bg + colored border — gradient bg দিও না card-এ
- Gradient button-এ box-shadow, flat button-এ shadow নেই
- Subject colors consistent: physics=blue, chemistry=purple, biology=pink
- Border-radius: cards/buttons=12px, small icons=8px
- Footer bg: #134E4A (dark teal)
