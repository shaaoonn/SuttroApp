'use client';

import type { LayerVisibility } from '../types';

interface Props {
  layers: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
  isFreefall?: boolean;
}

const LABELS: Record<keyof LayerVisibility, string> = {
  velocityArrow: 'বেগ Arrow',
  accelerationArrow: 'ত্বরণ Arrow',
  distanceMarkers: 'দূরত্ব marker',
  ghostTrail: 'Ghost trail',
  vGraph: 'v-t graph',
  sGraph: 's-t graph',
};

export default function LayerToggles({ layers, onToggle, isFreefall }: Props) {
  const keys = (Object.keys(layers) as (keyof LayerVisibility)[]).filter(
    // hide ghost trail in freefall (vertical scene doesn't show paths well)
    (k) => !(isFreefall && k === 'ghostTrail')
  );

  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.map((k) => {
        const on = layers[k];
        return (
          <button
            key={k}
            onClick={() => onToggle(k)}
            className="px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1"
            style={{
              background: on ? 'rgba(42, 157, 110, 0.15)' : 'transparent',
              color: on ? '#2A9D6E' : 'rgba(250, 251, 249, 0.45)',
              border: on
                ? '1px solid rgba(42, 157, 110, 0.4)'
                : '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span style={{ fontSize: '8px' }}>{on ? '●' : '○'}</span>
            {LABELS[k]}
          </button>
        );
      })}
    </div>
  );
}
