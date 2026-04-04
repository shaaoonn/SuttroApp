// ─────────────────────────────────────────────
// Simulation Thumbnail Data — SVG visuals
// Each simulation gets a unique visual thumbnail
// ─────────────────────────────────────────────

export interface SimThumbData {
  icon: string;
  bg: string;
  visual: string; // inline SVG string
}

export const SIM_THUMBNAILS: Record<string, SimThumbData> = {
  'ohms-law': {
    icon: '⚡',
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #2563EB 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="50" width="60" height="30" rx="4" fill="#3b82f6" stroke="#93c5fd" stroke-width="1.5"/>
      <text x="50" y="70" text-anchor="middle" fill="white" font-size="12" font-family="monospace">R</text>
      <line x1="0" y1="65" x2="20" y2="65" stroke="#93c5fd" stroke-width="2"/>
      <line x1="80" y1="65" x2="110" y2="65" stroke="#93c5fd" stroke-width="2"/>
      <circle cx="120" cy="65" r="18" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
      <text x="120" y="70" text-anchor="middle" fill="#fbbf24" font-size="12" font-family="monospace">A</text>
      <line x1="138" y1="65" x2="160" y2="65" stroke="#93c5fd" stroke-width="2"/>
      <rect x="160" y="55" width="30" height="20" rx="3" fill="none" stroke="#f87171" stroke-width="1.5"/>
      <line x1="165" y1="65" x2="170" y2="55" stroke="#f87171" stroke-width="1.5"/>
      <line x1="170" y1="55" x2="175" y2="75" stroke="#f87171" stroke-width="1.5"/>
      <line x1="175" y1="75" x2="180" y2="55" stroke="#f87171" stroke-width="1.5"/>
      <line x1="180" y1="55" x2="185" y2="65" stroke="#f87171" stroke-width="1.5"/>
      <line x1="190" y1="65" x2="240" y2="65" stroke="#93c5fd" stroke-width="2"/>
      <text x="120" y="110" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="monospace">V = IR</text>
    </svg>`,
  },

  'light-reflection': {
    icon: '🪞',
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #0ea5e9 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="118" y="10" width="4" height="110" fill="#94a3b8" rx="1"/>
      <line x1="118" y1="15" x2="110" y2="20" stroke="#64748b" stroke-width="1"/>
      <line x1="118" y1="30" x2="110" y2="35" stroke="#64748b" stroke-width="1"/>
      <line x1="118" y1="45" x2="110" y2="50" stroke="#64748b" stroke-width="1"/>
      <line x1="118" y1="60" x2="110" y2="65" stroke="#64748b" stroke-width="1"/>
      <line x1="118" y1="75" x2="110" y2="80" stroke="#64748b" stroke-width="1"/>
      <line x1="118" y1="90" x2="110" y2="95" stroke="#64748b" stroke-width="1"/>
      <line x1="118" y1="105" x2="110" y2="110" stroke="#64748b" stroke-width="1"/>
      <line x1="30" y1="20" x2="118" y2="65" stroke="#fbbf24" stroke-width="2.5"/>
      <polygon points="118,65 108,60 108,70" fill="#fbbf24"/>
      <line x1="118" y1="65" x2="210" y2="20" stroke="#f87171" stroke-width="2.5"/>
      <polygon points="210,20 202,28 198,18" fill="#f87171"/>
      <line x1="118" y1="65" x2="118" y2="20" stroke="white" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
      <text x="65" y="36" fill="#fbbf24" font-size="10" font-family="sans-serif">θi</text>
      <text x="155" y="36" fill="#f87171" font-size="10" font-family="sans-serif">θr</text>
      <text x="120" y="125" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">θi = θr</text>
    </svg>`,
  },

  'light-refraction': {
    icon: '🌈',
    bg: 'linear-gradient(135deg, #1e3a5f 0%, #6366f1 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="60" width="240" height="70" fill="#3b82f6" opacity="0.25" rx="0"/>
      <line x1="0" y1="60" x2="240" y2="60" stroke="#60a5fa" stroke-width="1"/>
      <line x1="120" y1="0" x2="120" y2="130" stroke="white" stroke-width="1" stroke-dasharray="4,3" opacity="0.3"/>
      <line x1="50" y1="5" x2="120" y2="60" stroke="#fbbf24" stroke-width="2.5"/>
      <polygon points="120,60 112,50 116,48" fill="#fbbf24"/>
      <line x1="120" y1="60" x2="170" y2="120" stroke="#f87171" stroke-width="2.5"/>
      <polygon points="170,120 162,112 168,108" fill="#f87171"/>
      <text x="85" y="30" fill="#fbbf24" font-size="10">θ₁</text>
      <text x="138" y="90" fill="#f87171" font-size="10">θ₂</text>
      <text x="20" y="50" fill="white" font-size="9" opacity="0.6">বায়ু</text>
      <text x="20" y="80" fill="#93c5fd" font-size="9" opacity="0.8">কাচ</text>
      <text x="120" y="125" text-anchor="middle" fill="white" font-size="10">n₁ sin θ₁ = n₂ sin θ₂</text>
    </svg>`,
  },

  'acid-base': {
    icon: '🧪',
    bg: 'linear-gradient(135deg, #3b1c6e 0%, #7C3AED 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M80 30 L80 70 L60 110 L100 110 Z" fill="#ef4444" opacity="0.5" stroke="#fca5a5" stroke-width="1.5"/>
      <text x="80" y="95" text-anchor="middle" fill="white" font-size="10">HCl</text>
      <text x="80" y="25" text-anchor="middle" fill="#fca5a5" font-size="9">pH 1</text>
      <path d="M160 30 L160 70 L140 110 L180 110 Z" fill="#3b82f6" opacity="0.5" stroke="#93c5fd" stroke-width="1.5"/>
      <text x="160" y="95" text-anchor="middle" fill="white" font-size="10">NaOH</text>
      <text x="160" y="25" text-anchor="middle" fill="#93c5fd" font-size="9">pH 14</text>
      <rect x="5" y="115" width="230" height="12" rx="6" fill="none" stroke="white" stroke-width="0.5" opacity="0.3"/>
      <defs><linearGradient id="phg" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ef4444"/><stop offset="50%" stop-color="#22c55e"/><stop offset="100%" stop-color="#6366f1"/>
      </linearGradient></defs>
      <rect x="5" y="115" width="230" height="12" rx="6" fill="url(#phg)" opacity="0.7"/>
      <text x="10" y="124" fill="white" font-size="7" font-weight="bold">0</text>
      <text x="115" y="124" fill="white" font-size="7" font-weight="bold">7</text>
      <text x="225" y="124" fill="white" font-size="7" font-weight="bold">14</text>
    </svg>`,
  },

  'atomic-structure': {
    icon: '⚛️',
    bg: 'linear-gradient(135deg, #3b1c6e 0%, #a855f7 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="120" cy="65" r="14" fill="#fbbf24" opacity="0.8"/>
      <text x="120" y="69" text-anchor="middle" fill="#1e1e1e" font-size="11" font-weight="bold">Na</text>
      <circle cx="120" cy="65" r="28" fill="none" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
      <circle cx="120" cy="65" r="42" fill="none" stroke="#34d399" stroke-width="1" opacity="0.5"/>
      <circle cx="120" cy="65" r="56" fill="none" stroke="#f472b6" stroke-width="1" opacity="0.5"/>
      <circle cx="148" cy="65" r="3.5" fill="#60a5fa"/><circle cx="92" cy="65" r="3.5" fill="#60a5fa"/>
      <circle cx="155" cy="45" r="3.5" fill="#34d399"/><circle cx="85" cy="85" r="3.5" fill="#34d399"/>
      <circle cx="155" cy="85" r="3.5" fill="#34d399"/><circle cx="85" cy="45" r="3.5" fill="#34d399"/>
      <circle cx="120" cy="23" r="3.5" fill="#34d399"/><circle cx="120" cy="107" r="3.5" fill="#34d399"/>
      <circle cx="145" cy="18" r="3.5" fill="#34d399"/>
      <circle cx="176" cy="65" r="3.5" fill="#f472b6"/>
      <text x="120" y="125" text-anchor="middle" fill="white" font-size="10" opacity="0.7">2, 8, 1</text>
    </svg>`,
  },

  'cell-division': {
    icon: '🧬',
    bg: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="65" rx="50" ry="40" fill="#34d399" opacity="0.2" stroke="#34d399" stroke-width="1.5"/>
      <ellipse cx="80" cy="65" rx="18" ry="15" fill="#6ee7b7" opacity="0.3" stroke="#6ee7b7" stroke-width="1"/>
      <line x1="72" y1="50" x2="88" y2="80" stroke="#fbbf24" stroke-width="1.5"/>
      <line x1="88" y1="50" x2="72" y2="80" stroke="#fbbf24" stroke-width="1.5"/>
      <text x="140" y="65" fill="white" font-size="22" opacity="0.6">→</text>
      <ellipse cx="185" cy="45" rx="28" ry="22" fill="#34d399" opacity="0.2" stroke="#34d399" stroke-width="1.5"/>
      <ellipse cx="185" cy="85" rx="28" ry="22" fill="#34d399" opacity="0.2" stroke="#34d399" stroke-width="1.5"/>
      <text x="120" y="122" text-anchor="middle" fill="white" font-size="10" opacity="0.7">2n → 2n</text>
    </svg>`,
  },

  'photosynthesis': {
    icon: '🌿',
    bg: 'linear-gradient(135deg, #064e3b 0%, #16a34a 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="30" r="20" fill="#fbbf24" opacity="0.6"/>
      <line x1="55" y1="40" x2="80" y2="60" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3,2"/>
      <line x1="60" y1="30" x2="85" y2="50" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3,2"/>
      <line x1="55" y1="18" x2="80" y2="35" stroke="#fbbf24" stroke-width="2" stroke-dasharray="3,2"/>
      <ellipse cx="130" cy="65" rx="50" ry="30" fill="#22c55e" opacity="0.4" stroke="#4ade80" stroke-width="1.5"/>
      <circle cx="115" cy="60" r="5" fill="#15803d" opacity="0.6"/>
      <circle cx="125" cy="70" r="4" fill="#15803d" opacity="0.6"/>
      <circle cx="140" cy="58" r="4.5" fill="#15803d" opacity="0.6"/>
      <text x="40" y="105" fill="#93c5fd" font-size="9">CO₂ + H₂O</text>
      <text x="155" y="55" fill="white" font-size="9">→</text>
      <text x="175" y="55" fill="#fde68a" font-size="9">C₆H₁₂O₆</text>
      <text x="175" y="75" fill="#86efac" font-size="9">+ O₂</text>
      <circle cx="200" cy="100" r="4" fill="#60a5fa" opacity="0.5"/>
      <circle cx="210" cy="95" r="3" fill="#60a5fa" opacity="0.4"/>
      <circle cx="195" cy="108" r="3.5" fill="#60a5fa" opacity="0.3"/>
    </svg>`,
  },

  'pythagorean': {
    icon: '📐',
    bg: 'linear-gradient(135deg, #7f1d1d 0%, #DC2626 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="40,100 40,30 180,100" fill="none" stroke="white" stroke-width="2"/>
      <rect x="40" y="86" width="14" height="14" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
      <text x="35" y="70" text-anchor="end" fill="#93c5fd" font-size="13" font-weight="bold">a</text>
      <text x="110" y="118" text-anchor="middle" fill="#86efac" font-size="13" font-weight="bold">b</text>
      <text x="118" y="58" text-anchor="middle" fill="#fca5a5" font-size="13" font-weight="bold">c</text>
      <rect x="40" y="30" width="18" height="18" fill="#60a5fa" opacity="0.2" stroke="#60a5fa" stroke-width="1"/>
      <text x="49" y="42" text-anchor="middle" fill="#93c5fd" font-size="6">a²</text>
      <text x="195" y="105" fill="white" font-size="14" font-weight="bold" font-family="monospace">c² = a² + b²</text>
    </svg>`,
  },

  'circle-geometry': {
    icon: '⭕',
    bg: 'linear-gradient(135deg, #7f1d1d 0%, #e11d48 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="110" cy="65" r="45" fill="none" stroke="white" stroke-width="2" opacity="0.6"/>
      <circle cx="110" cy="65" r="45" fill="#f43f5e" opacity="0.1"/>
      <line x1="110" y1="65" x2="155" y2="65" stroke="#fbbf24" stroke-width="2"/>
      <text x="132" y="60" fill="#fbbf24" font-size="11" font-weight="bold">r</text>
      <circle cx="110" cy="65" r="2.5" fill="white"/>
      <text x="200" y="45" fill="white" font-size="11" font-family="monospace">A = πr²</text>
      <text x="200" y="70" fill="white" font-size="11" font-family="monospace">C = 2πr</text>
      <text x="200" y="95" fill="#fbbf24" font-size="10">π ≈ 3.14159</text>
    </svg>`,
  },

  'trigonometry': {
    icon: '📊',
    bg: 'linear-gradient(135deg, #7c2d12 0%, #EA580C 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="70" r="45" fill="none" stroke="white" stroke-width="1" opacity="0.3"/>
      <line x1="55" y1="70" x2="145" y2="70" stroke="white" stroke-width="1" opacity="0.4"/>
      <line x1="100" y1="25" x2="100" y2="115" stroke="white" stroke-width="1" opacity="0.4"/>
      <line x1="100" y1="70" x2="139" y2="44" stroke="white" stroke-width="2"/>
      <line x1="139" y1="44" x2="139" y2="70" stroke="#ef4444" stroke-width="2"/>
      <line x1="100" y1="70" x2="139" y2="70" stroke="#22c55e" stroke-width="2"/>
      <circle cx="139" cy="44" r="3" fill="white"/>
      <text x="140" y="60" fill="#ef4444" font-size="9" font-weight="bold">sin</text>
      <text x="115" y="84" fill="#22c55e" font-size="9" font-weight="bold">cos</text>
      <path d="M 112 70 A 12 12 0 0 0 109 60" fill="none" stroke="#fbbf24" stroke-width="1.5"/>
      <text x="116" y="64" fill="#fbbf24" font-size="8">θ</text>
      <text x="185" y="50" fill="white" font-size="10" font-family="monospace">sin θ</text>
      <text x="185" y="70" fill="white" font-size="10" font-family="monospace">cos θ</text>
      <text x="185" y="90" fill="white" font-size="10" font-family="monospace">tan θ</text>
    </svg>`,
  },

  'straight-line': {
    icon: '📈',
    bg: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="30" y1="110" x2="30" y2="10" stroke="white" stroke-width="1" opacity="0.4"/>
      <line x1="20" y1="100" x2="220" y2="100" stroke="white" stroke-width="1" opacity="0.4"/>
      <line x1="30" y1="100" x2="200" y2="20" stroke="#fbbf24" stroke-width="2.5"/>
      <circle cx="30" cy="75" r="4" fill="#60a5fa"/>
      <text x="18" y="72" fill="#60a5fa" font-size="8" text-anchor="end">c</text>
      <line x1="80" y1="62" x2="140" y2="62" stroke="#34d399" stroke-width="1.5" stroke-dasharray="3,2"/>
      <line x1="140" y1="62" x2="140" y2="33" stroke="#f87171" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="108" y="75" fill="#34d399" font-size="8">Δx</text>
      <text x="145" y="50" fill="#f87171" font-size="8">Δy</text>
      <text x="165" y="118" fill="white" font-size="14" font-weight="bold" font-family="monospace">y = mx + c</text>
    </svg>`,
  },

  'sentence-structure': {
    icon: '📝',
    bg: 'linear-gradient(135deg, #164e63 0%, #0891B2 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="25" width="60" height="30" rx="6" fill="#3b82f6" opacity="0.7"/>
      <text x="45" y="44" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Subject</text>
      <rect x="90" y="25" width="55" height="30" rx="6" fill="#ef4444" opacity="0.7"/>
      <text x="117" y="44" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Verb</text>
      <rect x="160" y="25" width="65" height="30" rx="6" fill="#22c55e" opacity="0.7"/>
      <text x="192" y="44" text-anchor="middle" fill="white" font-size="11" font-weight="bold">Object</text>
      <line x1="75" y1="40" x2="90" y2="40" stroke="white" stroke-width="1.5" opacity="0.4"/>
      <line x1="145" y1="40" x2="160" y2="40" stroke="white" stroke-width="1.5" opacity="0.4"/>
      <rect x="20" y="75" width="200" height="28" rx="5" fill="white" opacity="0.1" stroke="white" stroke-width="0.5" opacity="0.3"/>
      <text x="30" y="93" fill="#60a5fa" font-size="10">The cat</text>
      <text x="85" y="93" fill="#f87171" font-size="10">sat</text>
      <text x="115" y="93" fill="#4ade80" font-size="10">on the mat</text>
      <text x="120" y="120" text-anchor="middle" fill="white" font-size="9" opacity="0.5">S + V + O</text>
    </svg>`,
  },

  'tense-timeline': {
    icon: '⏳',
    bg: 'linear-gradient(135deg, #164e63 0%, #06b6d4 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="55" x2="230" y2="55" stroke="white" stroke-width="2" opacity="0.5"/>
      <polygon points="230,55 222,50 222,60" fill="white" opacity="0.5"/>
      <circle cx="60" cy="55" r="5" fill="#f87171"/>
      <circle cx="120" cy="55" r="7" fill="#fbbf24" stroke="white" stroke-width="1.5"/>
      <circle cx="180" cy="55" r="5" fill="#34d399"/>
      <text x="60" y="42" text-anchor="middle" fill="#fca5a5" font-size="10" font-weight="bold">Past</text>
      <text x="120" y="40" text-anchor="middle" fill="#fde68a" font-size="10" font-weight="bold">NOW</text>
      <text x="180" y="42" text-anchor="middle" fill="#86efac" font-size="10" font-weight="bold">Future</text>
      <rect x="20" y="75" width="55" height="16" rx="4" fill="#f87171" opacity="0.3"/>
      <text x="47" y="87" text-anchor="middle" fill="white" font-size="7">Simple</text>
      <rect x="80" y="75" width="80" height="16" rx="4" fill="#fbbf24" opacity="0.3"/>
      <text x="120" y="87" text-anchor="middle" fill="white" font-size="7">Continuous</text>
      <rect x="165" y="75" width="60" height="16" rx="4" fill="#34d399" opacity="0.3"/>
      <text x="195" y="87" text-anchor="middle" fill="white" font-size="7">Perfect</text>
      <text x="120" y="115" text-anchor="middle" fill="white" font-size="11" font-family="monospace">12 Tenses</text>
    </svg>`,
  },
};
