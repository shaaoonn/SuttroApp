'use client';

// ─────────────────────────────────────────────
// ReadoutPanel - Live measurement display (bottom-left)
// Fixed overlay (Layer 3) - stays in place during pan/zoom
// Shows computed values from simulation logic
// ─────────────────────────────────────────────

interface ReadoutEntry {
  id: string;
  label: { bn: string; en: string };
  value: number;
  unit: string;
  decimals?: number;
}

interface ReadoutPanelProps {
  entries: ReadoutEntry[];
}

export default function ReadoutPanel({ entries }: ReadoutPanelProps) {
  if (entries.length === 0) return null;

  return (
    <div className="readout-panel bottom-14 left-3 p-4 min-w-[180px]">
      <span
        className="text-xs font-semibold uppercase tracking-wider block mb-2"
        style={{ color: 'var(--player-muted)' }}
      >
        পরিমাপ
      </span>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex justify-between text-sm mb-1 last:mb-0 gap-4"
        >
          <span style={{ color: 'var(--player-text)' }}>
            {entry.label.bn}
          </span>
          <span
            className="font-mono"
            style={{ color: 'var(--canvas-label)' }}
          >
            {entry.value.toFixed(entry.decimals ?? 2)} {entry.unit}
          </span>
        </div>
      ))}
    </div>
  );
}
