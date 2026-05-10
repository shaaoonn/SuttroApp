// ─────────────────────────────────────────────
// Simulation Thumbnail Data - SVG visuals
// Each simulation gets a unique visual thumbnail
// ─────────────────────────────────────────────

export interface SimThumbData {
  icon: string;
  bg: string;
  visual: string; // inline SVG string
}

export const SIM_THUMBNAILS: Record<string, SimThumbData> = {
  'force-acceleration': {
    icon: '🛒',
    bg: 'linear-gradient(135deg, #FBBF24 0%, #F97316 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- sky -->
      <rect x="0" y="0" width="240" height="80" fill="#7CC2F0"/>
      <circle cx="200" cy="22" r="11" fill="#FFD86E"/>
      <ellipse cx="60" cy="22" rx="20" ry="8" fill="white" opacity="0.9"/>
      <!-- ground / road -->
      <rect x="0" y="80" width="240" height="50" fill="#5A9A4A"/>
      <rect x="0" y="86" width="240" height="22" fill="#2D3340"/>
      <line x1="0" y1="97" x2="240" y2="97" stroke="white" stroke-width="1.2" stroke-dasharray="6,4" opacity="0.7"/>
      <!-- 3 pushers -->
      <text x="48" y="78" font-size="20" text-anchor="middle">🧒</text>
      <text x="68" y="78" font-size="20" text-anchor="middle">🧒</text>
      <text x="88" y="78" font-size="20" text-anchor="middle">🧒</text>
      <!-- cart skateboard -->
      <rect x="105" y="55" width="56" height="26" rx="3" fill="#B8814B" stroke="#5C3917" stroke-width="1.5"/>
      <line x1="105" y1="56" x2="161" y2="80" stroke="#5C3917" stroke-width="1.5"/>
      <line x1="161" y1="56" x2="105" y2="80" stroke="#5C3917" stroke-width="1.5"/>
      <rect x="105" y="80" width="56" height="4" rx="1" fill="#92400E"/>
      <circle cx="115" cy="86" r="5" fill="#10B981"/>
      <circle cx="151" cy="86" r="5" fill="#10B981"/>
      <!-- F arrow over cart -->
      <line x1="135" y1="44" x2="200" y2="44" stroke="#EA580C" stroke-width="3"/>
      <polygon points="200,44 192,40 192,48" fill="#EA580C"/>
      <text x="167" y="38" fill="#EA580C" font-size="11" font-weight="bold">F = ma</text>
      <!-- title -->
      <text x="120" y="125" text-anchor="middle" fill="white" font-size="13" font-weight="bold" font-family="sans-serif">Newton 2nd Law</text>
    </svg>`,
  },

  inertia: {
    icon: '🚌',
    bg: 'linear-gradient(135deg, #FCD34D 0%, #FB923C 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Sky -->
      <rect x="0" y="0" width="240" height="80" fill="#7CC2F0"/>
      <circle cx="200" cy="22" r="11" fill="#FFD86E"/>
      <ellipse cx="50" cy="22" rx="20" ry="8" fill="white" opacity="0.9"/>
      <ellipse cx="155" cy="18" rx="16" ry="6" fill="white" opacity="0.85"/>
      <!-- Ground -->
      <rect x="0" y="80" width="240" height="50" fill="#5A9A4A"/>
      <!-- Road -->
      <rect x="0" y="86" width="240" height="22" fill="#2D3340"/>
      <line x1="0" y1="87" x2="240" y2="87" stroke="#FFC93C" stroke-width="1.4"/>
      <line x1="0" y1="107" x2="240" y2="107" stroke="#FFC93C" stroke-width="1.4"/>
      <line x1="0" y1="97" x2="240" y2="97" stroke="white" stroke-width="1.2" stroke-dasharray="6,4" opacity="0.7"/>
      <!-- Bus body (cutaway, yellow) -->
      <rect x="50" y="50" width="120" height="38" rx="6" fill="#FFC93C" stroke="#92400E" stroke-width="1.5"/>
      <!-- Window cutaway showing interior -->
      <rect x="56" y="58" width="108" height="22" rx="2" fill="white" opacity="0.85"/>
      <!-- Passenger leaning forward -->
      <text x="100" y="76" font-size="18" text-anchor="middle">🧍</text>
      <!-- Lurch arrow -->
      <line x1="105" y1="63" x2="125" y2="63" stroke="#BE185D" stroke-width="2"/>
      <polygon points="125,63 121,60 121,66" fill="#BE185D"/>
      <!-- Wheels -->
      <circle cx="74" cy="92" r="6" fill="#1F2937"/>
      <circle cx="146" cy="92" r="6" fill="#1F2937"/>
      <!-- Brake indicator -->
      <text x="190" y="68" fill="#DC2626" font-size="14" font-weight="bold">🛑</text>
      <!-- Title -->
      <text x="120" y="125" text-anchor="middle" fill="white" font-size="13" font-weight="bold" font-family="sans-serif">F_net = 0 → constant v</text>
    </svg>`,
  },

  motion: {
    icon: '🚗',
    bg: 'linear-gradient(135deg, #0B1D3A 0%, #1B6B4A 100%)',
    visual: `<svg viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- sky / stars -->
      <rect x="0" y="0" width="240" height="80" fill="#0B1D3A"/>
      <circle cx="40" cy="20" r="0.8" fill="white" opacity="0.6"/>
      <circle cx="78" cy="34" r="0.8" fill="white" opacity="0.4"/>
      <circle cx="190" cy="18" r="0.9" fill="white" opacity="0.5"/>
      <circle cx="220" cy="38" r="0.7" fill="white" opacity="0.4"/>
      <!-- v-t graph in upper area -->
      <line x1="155" y1="58" x2="225" y2="58" stroke="white" stroke-width="0.6" opacity="0.25"/>
      <line x1="160" y1="58" x2="160" y2="20" stroke="white" stroke-width="0.6" opacity="0.25"/>
      <polyline points="160,52 175,42 195,28 220,20" fill="none" stroke="#2A9D6E" stroke-width="2"/>
      <circle cx="220" cy="20" r="2" fill="#2A9D6E"/>
      <text x="160" y="16" fill="#2A9D6E" font-size="7" font-family="monospace">v-t</text>
      <!-- ground -->
      <rect x="0" y="80" width="240" height="50" fill="#1F2937"/>
      <!-- road -->
      <rect x="0" y="86" width="240" height="22" fill="#2D3340"/>
      <line x1="0" y1="87" x2="240" y2="87" stroke="#E8A838" stroke-width="1.2"/>
      <line x1="0" y1="107" x2="240" y2="107" stroke="#E8A838" stroke-width="1.2"/>
      <!-- dashed center -->
      <line x1="0" y1="97" x2="240" y2="97" stroke="white" stroke-width="1" stroke-dasharray="6,4" opacity="0.5"/>
      <!-- distance ticks + labels -->
      <line x1="40" y1="86" x2="40" y2="90" stroke="white" stroke-width="0.8" opacity="0.5"/>
      <line x1="100" y1="86" x2="100" y2="90" stroke="white" stroke-width="0.8" opacity="0.5"/>
      <line x1="160" y1="86" x2="160" y2="90" stroke="white" stroke-width="0.8" opacity="0.5"/>
      <text x="40" y="120" text-anchor="middle" fill="white" font-size="6" opacity="0.5">0</text>
      <text x="100" y="120" text-anchor="middle" fill="white" font-size="6" opacity="0.5">10m</text>
      <text x="160" y="120" text-anchor="middle" fill="white" font-size="6" opacity="0.5">20m</text>
      <!-- car silhouette -->
      <ellipse cx="80" cy="103" rx="22" ry="1.2" fill="black" opacity="0.4"/>
      <path d="M58 96 L66 92 L72 86 L88 86 L96 92 L102 96 L102 100 L58 100 Z" fill="#E8A838"/>
      <path d="M68 92 L73 88 L88 88 L94 92 Z" fill="#0B1D3A"/>
      <circle cx="68" cy="100" r="4" fill="#1F2937"/>
      <circle cx="92" cy="100" r="4" fill="#1F2937"/>
      <circle cx="68" cy="100" r="1.5" fill="#4B5563"/>
      <circle cx="92" cy="100" r="1.5" fill="#4B5563"/>
      <!-- velocity arrow over car -->
      <line x1="80" y1="80" x2="115" y2="80" stroke="#2A9D6E" stroke-width="1.6"/>
      <polygon points="115,80 110,77.5 110,82.5" fill="#2A9D6E"/>
      <text x="83" y="76" fill="#2A9D6E" font-size="6.5" font-weight="bold">v</text>
      <!-- formula -->
      <text x="120" y="50" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="monospace">v = u + at</text>
    </svg>`,
  },
};
