# সূত্র — Player System Specification

## Core Concept
Both video and simulation players use the SAME player shell — visually identical,
behaviorally consistent. The player is a self-contained unit like a YouTube embed:
works inline on any page AND can go fullscreen with one click.

---

## Player Shell Structure

```html
<div class="suttro-player" id="player-{id}">
  <!-- Top Bar -->
  <div class="player-topbar">
    <div class="player-info">
      <span class="chapter-tag">পদার্থবিজ্ঞান · অধ্যায় ৯</span>
      <span class="player-title">ওহমের সূত্র সিমুলেশন</span>
    </div>
    <button class="fullscreen-toggle">⛶</button>
  </div>

  <!-- Content Area (swapped based on type) -->
  <div class="player-content">
    <!-- For simulations: Canvas + fixed overlays -->
    <!-- For videos: HLS video element -->
  </div>

  <!-- Bottom Bar -->
  <div class="player-bottombar">
    <span class="player-brand">সূত্র | suttro.app</span>
    <div class="player-tools">
      <!-- Simulation: zoom, fit, hand/mouse, fullscreen -->
      <!-- Video: progress, play/pause, volume, speed, fullscreen -->
    </div>
  </div>
</div>
```

---

## Inline vs Fullscreen — ZERO Difference Rule

### The Rule
There must be NO functional or visual difference between inline and fullscreen modes
except SIZE. Everything visible inline is visible fullscreen. Nothing new appears,
nothing disappears.

### Implementation
```javascript
// Fullscreen toggle — that's IT. No re-render.
function toggleFullscreen(playerId) {
  const player = document.getElementById(playerId);
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    player.requestFullscreen();
  }
}
```

### CSS Handles Everything
```css
.suttro-player {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 10px;
  overflow: hidden;
  background: #0d1117;
}

/* Fullscreen: just fill the screen */
.suttro-player:fullscreen {
  border-radius: 0;
  aspect-ratio: auto;
  width: 100vw;
  height: 100vh;
}

/* All internal elements use %, fr, or flex — never fixed px widths */
.player-content {
  flex: 1;
  width: 100%;
  /* Content scales automatically */
}
```

### Mobile Fullscreen
- Triggers landscape orientation lock when fullscreen
- Returns to portrait on exit
- Touch targets remain ≥44px in both modes

---

## Video Player Specifics

### Bottom Bar for Video
```
[▶ Play/Pause]  [0:32 / 5:45]  [━━━━━━━━━●━━━]  [🔊 Vol]  [1x Speed]  [⛶]
```

| Control | Feature |
|---------|---------|
| Play/Pause | Toggle playback |
| Time | Current / Total duration |
| Progress bar | Seekable, buffered area shown |
| Volume | Slider, mute toggle |
| Speed | 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x |
| Fullscreen | Same toggle as simulation |

### Video Streaming
```javascript
// HLS.js for adaptive bitrate
import Hls from 'hls.js';

if (Hls.isSupported()) {
  const hls = new Hls();
  hls.loadSource('https://stream.suttro.app/class/2026-04-02.m3u8');
  hls.attachMedia(videoElement);
}
```

### Video Quality Levels
- 360p (low bandwidth, mobile data)
- 480p (default mobile)
- 720p (default desktop)
- 1080p (fullscreen desktop)
- Auto (adaptive based on connection)

---

## Simulation Player Specifics

### Bottom Bar for Simulation
```
[সূত্র | suttro.app]  ···  [100%] [−] [+]  |  [⤢ Fit]  |  [✋] [🖱️]  |  [⛶]
```

See `simulation-engine.md` for full toolbar specification.

### Key Difference from Video
- Video has a progress/seek bar — simulation does not
- Simulation has zoom/pan/mode tools — video does not
- Both share: top bar (chapter info), fullscreen toggle, brand watermark

---

## Player Embedding

### On Page (Inline)
```jsx
// Simulation
<SimulationPlayer
  slug="ohms-law"
  chapter={{ subject: 'physics', class: 9, chapter: 9 }}
/>

// Video
<VideoPlayer
  slug="2026-04-02-class"
  chapter={{ subject: 'physics', class: 9, chapter: 9 }}
/>
```

### In Hero Section (Homepage)
The hero section has a live simulation player (not a screenshot).
Player is slightly larger (max-width: 720px) and auto-starts.

### Embed via iframe (for sharing/external sites)
```html
<iframe
  src="https://suttro.app/embed/sim/ohms-law"
  width="100%" height="450"
  frameborder="0" allowfullscreen
></iframe>
```

---

## Player Design Tokens

```css
.suttro-player {
  --player-bg: #0d1117;
  --player-topbar: rgba(255,255,255,0.04);
  --player-bottombar: rgba(255,255,255,0.03);
  --player-border: rgba(255,255,255,0.06);
  --player-text: rgba(255,255,255,0.85);
  --player-muted: rgba(255,255,255,0.35);
  --player-accent: #1B6B4A;
  --player-radius: 10px;
}
```
