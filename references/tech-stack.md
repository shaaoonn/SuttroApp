# সূত্র — Technical Stack & Infrastructure

## Stack Overview

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14+ |
| Language | TypeScript | 5+ |
| UI | Tailwind CSS + Hind Siliguri font | 3.4+ |
| Simulation | HTML5 Canvas API + React hooks | Native |
| Graphs/Charts | D3.js | 7+ |
| Pan/Zoom | Custom (CSS transform + pointer events) | — |
| Video | HLS.js | 1.5+ |
| Video CDN | Cloudflare Stream or Bunny.net | — |
| Database | PostgreSQL via Supabase | 16+ |
| Auth | Supabase Auth (Phone OTP) | — |
| Cache | Redis | 7+ |
| Payment | bKash/Nagad API | — |
| Hosting | Docker → Coolify on Contabo VPS | — |
| Mobile App | Capacitor.js (WebView wrapper) | 5+ |
| PWA | next-pwa + Service Worker | — |
| Offline Storage | IndexedDB (encrypted) | — |
| Deep Links | Android App Links + iOS Universal Links | — |
| AI Content | Claude Code (simulation generation) | — |

---

## Project Structure

```
suttro-platform/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with fonts, meta
│   │   ├── page.tsx                  # Homepage (hero + features)
│   │   ├── simulations/
│   │   │   └── page.tsx              # Simulation gallery
│   │   ├── sim/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Individual simulation player
│   │   ├── classes/
│   │   │   └── page.tsx              # Class archive
│   │   ├── class/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Individual class video
│   │   ├── about/
│   │   │   └── page.tsx              # About page
│   │   ├── login/
│   │   │   └── page.tsx              # Phone OTP login
│   │   ├── dashboard/
│   │   │   └── page.tsx              # User dashboard
│   │   ├── pricing/
│   │   │   └── page.tsx              # Pricing plans
│   │   ├── embed/
│   │   │   └── sim/
│   │   │       └── [slug]/
│   │   │           └── page.tsx      # Embeddable simulation (iframe)
│   │   └── api/
│   │       ├── simulations/          # Simulation metadata API
│   │       ├── classes/              # Class video API
│   │       └── auth/                 # Auth helpers
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── MobileMenu.tsx
│   │   ├── player/
│   │   │   ├── PlayerShell.tsx       # Shared player container
│   │   │   ├── SimulationPlayer.tsx  # Canvas-based sim player
│   │   │   ├── VideoPlayer.tsx       # HLS video player
│   │   │   ├── BottomToolbar.tsx     # Toolbar with zoom/mode/fullscreen
│   │   │   ├── ControlPanel.tsx      # Floating variable sliders
│   │   │   ├── ReadoutPanel.tsx      # Live measurement display
│   │   │   └── FullscreenToggle.tsx
│   │   ├── simulation/
│   │   │   ├── DotGridCanvas.tsx     # Dot-grid background
│   │   │   ├── PanZoomContainer.tsx  # Google Maps-style transform
│   │   │   ├── InteractionMode.tsx   # Hand/Mouse mode toggle
│   │   │   └── SimulationCard.tsx    # Gallery card
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Slider.tsx            # Custom range slider
│   │   │   ├── Badge.tsx
│   │   │   └── SubjectTag.tsx        # Color-coded subject indicator
│   │   └── home/
│   │       ├── HeroSimulation.tsx    # Live sim in hero section
│   │       ├── StatsBar.tsx
│   │       └── FeatureSection.tsx
│   │
│   ├── simulations/                  # ALL simulation components
│   │   ├── registry.ts              # Central registry of all sims
│   │   ├── physics/
│   │   │   ├── ohms-law/
│   │   │   │   ├── OhmsLawSim.tsx
│   │   │   │   ├── useOhmsLaw.ts    # Physics logic hook
│   │   │   │   ├── components/      # Circuit visual elements
│   │   │   │   └── config.ts        # Variables, limits, defaults
│   │   │   ├── newtons-laws/
│   │   │   ├── light-reflection/
│   │   │   ├── electric-current/
│   │   │   └── magnetic-field/
│   │   ├── chemistry/
│   │   │   ├── acid-base/
│   │   │   ├── periodic-table/
│   │   │   └── chemical-reactions/
│   │   └── biology/
│   │       ├── cell-division/
│   │       ├── photosynthesis/
│   │       └── digestive-system/
│   │
│   ├── hooks/
│   │   ├── usePanZoom.ts            # Pan/zoom state management
│   │   ├── useInteractionMode.ts    # Hand/Mouse mode
│   │   ├── useFullscreen.ts         # Fullscreen API wrapper
│   │   ├── useOfflineDownload.ts    # Download & cache manager
│   │   └── useDeepLink.ts           # Deep link handler
│   │
│   ├── lib/
│   │   ├── supabase.ts              # Supabase client
│   │   ├── simulation-registry.ts   # Load sim by slug
│   │   └── encryption.ts            # Content encryption utils
│   │
│   └── styles/
│       ├── globals.css              # Tailwind + brand tokens
│       └── simulation.css           # Canvas-specific styles
│
├── public/
│   ├── manifest.json               # PWA manifest
│   ├── sw.js                       # Service Worker
│   ├── .well-known/
│   │   ├── assetlinks.json         # Android App Links
│   │   └── apple-app-site-association # iOS Universal Links
│   └── icons/                      # App icons (192, 512px)
│
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── tsconfig.json
```

---

## Deployment (Coolify + Contabo)

### Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  suttro-web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    restart: always

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Coolify Setup
- Domain: suttro.app → Coolify proxy → Docker container
- SSL: Auto (Let's Encrypt via Coolify)
- VPS: Contabo (same server as EJOSB IT automation)
- Git: Push to GitHub → Coolify auto-deploys

---

## Database Schema (Supabase/PostgreSQL)

```sql
-- Users (auth handled by Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  phone TEXT UNIQUE,
  name TEXT,
  class INTEGER DEFAULT 9, -- 9 or 10
  subscription_plan TEXT DEFAULT 'free', -- free, premium
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Simulation progress
CREATE TABLE simulation_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  simulation_slug TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(user_id, simulation_slug)
);

-- Video watch progress
CREATE TABLE video_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  video_slug TEXT NOT NULL,
  watched_seconds INTEGER DEFAULT 0,
  total_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, video_slug)
);

-- Bookmarks
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  content_type TEXT NOT NULL, -- 'simulation' or 'video'
  content_slug TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_slug)
);

-- Downloads (tracking only — actual files in device storage)
CREATE TABLE downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  content_type TEXT NOT NULL,
  content_slug TEXT NOT NULL,
  device_id TEXT NOT NULL,
  license_key TEXT NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=https://suttro.app
NEXT_PUBLIC_APP_NAME=সূত্র

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Redis
REDIS_URL=redis://redis:6379

# Video CDN
VIDEO_CDN_URL=https://stream.suttro.app
# or BUNNY_CDN_API_KEY=...

# Payment
BKASH_APP_KEY=...
BKASH_APP_SECRET=...
BKASH_USERNAME=...
BKASH_PASSWORD=...

# Encryption (for offline content)
CONTENT_ENCRYPTION_KEY=... (generate: openssl rand -hex 32)
```

---

## Existing Repo
GitHub: https://github.com/shaaoonn/SuttroApp
- Fresh repo for সূত্র platform
- Push ALL work here after every session
- See `references/claude-code-rules.md` for git conventions
