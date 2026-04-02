# সূত্র — Simulation Engine Specification

## Overview
The simulation engine is a Canvas-based interactive system inspired by PhET (functionality)
and Google Maps (navigation UX). Simulations are self-contained React components that
render on an HTML5 Canvas with a dot-grid background, pan/zoom navigation, and
floating fixed control panels.

---

## Canvas Architecture (3 Layers)

### Layer 1 — Dot Grid Background
```css
/* Dot grid pattern — resembles graph/engineering paper */
.sim-canvas {
  background-image: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 20px 20px; /* adjusts with zoom */
}
```
- Dots move WITH pan/zoom (part of the transform layer)
- Dot spacing scales with zoom level (visual feedback for zoom)
- Color: subtle white dots on dark background (#0d1117)

### Layer 2 — Simulation Objects (Transform Layer)
All interactive simulation elements live here:
- Circuit components (batteries, resistors, ammeters, bulbs)
- Wires and connections
- Molecular structures
- Cell diagrams
- Any draggable/interactive elements

**Pan/Zoom Implementation:**
```javascript
// CSS transform approach (GPU-accelerated)
const transformLayer = {
  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
  transformOrigin: '0 0'
};

// Pan: pointer drag events (hand mode only)
// Zoom: wheel event (hand mode only)
// Pinch-to-zoom on mobile (hand mode only)
```

This layer is controlled by `transform: translate(x,y) scale(z)`:
- In **Hand mode**: entire layer moves/scales together
- In **Mouse mode**: individual objects are draggable within the layer

### Layer 3 — Fixed UI Overlay
Control panels and readouts that stay in place regardless of pan/zoom:
```css
.fixed-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none; /* pass through clicks to canvas */
}
.control-panel, .readout-panel, .bottom-toolbar {
  pointer-events: auto; /* re-enable for UI elements */
  position: absolute;
  /* backdrop-filter: blur(8px) for translucent panels */
}
```

Includes:
- **Control Panel** (top-right): Sliders, dropdowns, toggles for variables
- **Readout Panel** (bottom-left): Live measurements (current, voltage, power)
- **Formula Display**: Active formula with substituted values
- **Bottom Toolbar**: Zoom controls, mode toggle, fullscreen
- **Reset Button**: Returns all values to defaults

---

## Two Interaction Modes

### Mouse Mode (Default)
- **Cursor**: Arrow (`cursor: default`)
- **Click/Drag on objects**: Move components, connect wires, adjust positions
- **Click on sliders**: Change variable values
- **Scroll wheel**: Does NOT zoom (normal page scroll)
- **Canvas background click**: Deselects active object

### Hand Mode
- **Cursor**: Grab (`cursor: grab`), Grabbing when dragging (`cursor: grabbing`)
- **Click/Drag anywhere**: Pans the entire canvas (Layer 1 + Layer 2)
- **Scroll wheel**: Zoom in/out (centered on cursor position)
- **Pinch gesture (mobile)**: Zoom in/out
- **Cannot**: interact with simulation objects (they're "behind glass")
- **Can**: still use fixed overlay controls (sliders, buttons in Layer 3)

### Mode Toggle
```
Keyboard shortcut: Spacebar (hold = temporary hand mode, like Photoshop)
Bottom toolbar: Click hand/mouse icon to toggle
Default on page load: Mouse mode
```

---

## Bottom Toolbar Specification

Layout (left to right):
```
[Brand: সূত্র | suttro.app]  ···spacer···  [100%] [−] [+]  |  [⤢ Fit]  |  [✋] [🖱️]  |  [⛶]
```

| Element | Action | Keyboard |
|---------|--------|----------|
| Zoom % display | Shows current zoom level (50%-400%) | — |
| − (Zoom out) | Decrease zoom by 10% | Ctrl + − |
| + (Zoom in) | Increase zoom by 10% | Ctrl + + |
| ⤢ Fit to screen | Reset zoom/pan to fit all content | Ctrl + 0 |
| ✋ Hand tool | Activate pan/zoom mode | Spacebar (hold) |
| 🖱️ Mouse tool | Activate interact mode (default) | Esc |
| ⛶ Fullscreen | Toggle fullscreen | F |

### Fit to Screen Behavior
- Calculates bounding box of all simulation objects
- Sets zoom level and pan position to show everything with 10% padding
- Animated transition (300ms, ease-out)

---

## Simulation Component Structure

Each simulation is a standalone React component:
```
/src/simulations/
├── physics/
│   ├── ohms-law/
│   │   ├── OhmsLawSim.tsx       (main component)
│   │   ├── useOhmsLaw.ts        (physics logic hook)
│   │   ├── components/           (circuit elements)
│   │   └── config.ts             (default values, limits)
│   ├── newtons-laws/
│   └── light-reflection/
├── chemistry/
│   ├── acid-base/
│   └── periodic-table/
└── biology/
    ├── cell-division/
    └── photosynthesis/
```

### Simulation Config Schema
```typescript
interface SimulationConfig {
  id: string;                    // "ohms-law"
  slug: string;                  // "ohms-law" (URL-safe)
  title: {
    bn: string;                  // "ওহমের সূত্র"
    en: string;                  // "Ohm's Law"
  };
  subject: 'physics' | 'chemistry' | 'biology';
  nctb: {
    class: 9 | 10;
    chapter: number;
    section: string;
  };
  variables: VariableConfig[];   // Controllable parameters
  formulas: FormulaConfig[];     // Displayed formulas
  defaultZoom: number;           // Initial zoom level (1.0 = 100%)
  canvasSize: { width: number; height: number }; // Virtual canvas size
}

interface VariableConfig {
  id: string;           // "resistance"
  label: { bn: string; en: string };
  unit: string;         // "Ω"
  min: number;
  max: number;
  default: number;
  step: number;
}
```

---

## Canvas Dark Theme

The simulation canvas ALWAYS uses a dark theme regardless of the page theme:
```css
.simulation-player {
  background: #0d1117;      /* Canvas background */
  color: #e6e6e6;           /* Default text */
}
.control-panel {
  background: rgba(15, 20, 30, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border-radius: 8px;
}
```

### Component Colors Inside Canvas
- Wires: #4a9eff (blue)
- Resistors: #e8a838 (gold border)
- Batteries: #4aef8a (green)
- Bulbs: #ffe066 (warm yellow, brighter when more current)
- Ammeters: #ff6b6b (red)
- Labels: rgba(255,255,255,0.9)
- Grid dots: rgba(255,255,255,0.08)

---

## Responsive Behavior

### Desktop (>1024px)
- Canvas takes ~70% width, sidebar with chapter info on right
- All toolbar features visible
- Hover states on objects

### Tablet (768-1024px)
- Canvas full width
- Chapter info collapses to a top bar
- Toolbar remains same

### Mobile (<768px)
- Canvas full width, taller aspect ratio
- Control panel moves to bottom overlay (swipe up to reveal)
- Toolbar icons only (no text labels)
- Pinch-to-zoom in hand mode
- Touch targets minimum 44px
- Fullscreen = landscape rotation encouraged

---

## Creating New Simulations with Claude Code

### Workflow
1. Identify NCTB chapter and concept
2. Define variables, formulas, and visual elements
3. Create React component following the structure above
4. Add to simulation registry (`/src/simulations/registry.ts`)
5. Create route at `/sim/[slug]`

### Claude Code Prompt Pattern
```
Create a simulation for [NCTB concept]. Variables: [list].
Formula: [formula]. Visual: [describe circuit/molecule/cell].
Follow Suttro simulation engine spec from references/simulation-engine.md.
Canvas dark theme, dot grid, pan/zoom support, floating control panels.
```

This allows rapid simulation creation — target: 1 simulation per hour with Claude Code.
