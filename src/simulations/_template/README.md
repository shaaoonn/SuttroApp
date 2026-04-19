# Simulation Template - সূত্র

এই ফোল্ডারটি নতুন সিমুলেশনের **টেমপ্লেট**। কখনো এটি সরাসরি modify করো না।

## নতুন সিমুলেশন তৈরি

```bash
# 1. কপি করো
cp -r src/simulations/_template/ src/simulations/physics/ohms-law/

# 2. রিনেম করো
mv src/simulations/physics/ohms-law/TemplateSim.tsx \
   src/simulations/physics/ohms-law/OhmsLawSim.tsx

# 3. config.ts এডিট করো - variables, formulas, canvas size
# 4. useSimulation.ts এডিট করো - physics/chemistry logic
# 5. TemplateSim.tsx এডিট করো - visual elements যোগ করো
# 6. registry.ts-তে register করো
# 7. app/sim/[slug]/page.tsx রাউটে যোগ করো
```

## ফাইল স্ট্রাকচার

```
_template/
├── TemplateSim.tsx     - Main player component (rename per sim)
├── useSimulation.ts    - Physics/logic hook (customize per sim)
├── config.ts           - Variables, limits, defaults (EDIT THIS)
├── components/
│   ├── SimObject.tsx   - Draggable object base
│   └── Wire.tsx        - Connection line component
└── README.md           - This file
```

## যা কাস্টমাইজ করবে
- `config.ts` - simulation-specific variables, formulas, NCTB mapping
- `useSimulation.ts` - calculated/computed values
- `TemplateSim.tsx` - canvas content (circuit elements, molecules, etc.)

## যা কাস্টমাইজ করবে **না**
- Player shell (topbar, bottombar)
- Pan/zoom behavior
- Hand/Mouse mode toggle
- Fullscreen behavior
- Dot grid background
- Control panel frame
- Readout panel frame
