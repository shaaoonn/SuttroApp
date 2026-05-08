'use client';

import type { LayerVisibility } from '../types';

interface Props {
  layers: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
  isFreefall?: boolean;
}

const META: Record<keyof LayerVisibility, { label: string; color: string }> = {
  velocityArrow:     { label: 'বেগ',    color: '#16A34A' },
  accelerationArrow: { label: 'ত্বরণ',  color: '#EA580C' },
  distanceMarkers:   { label: 'দূরত্ব', color: '#3B82F6' },
  ghostTrail:        { label: 'Ghost',  color: '#EC4899' },
  vGraph:            { label: 'v-t',    color: '#16A34A' },
  sGraph:            { label: 's-t',    color: '#F59E0B' },
};

export default function LayerToggles({ layers, onToggle, isFreefall }: Props) {
  const keys = (Object.keys(layers) as (keyof LayerVisibility)[]).filter(
    (k) => !(isFreefall && k === 'ghostTrail'),
  );

  return (
    <div className="flex flex-wrap gap-1">
      {keys.map((k) => {
        const on = layers[k];
        const meta = META[k];
        return (
          <button
            key={k}
            onClick={() => onToggle(k)}
            className="px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1"
            style={{
              background: on ? meta.color : '#F1F5F9',
              color: on ? '#FFFFFF' : '#94A3B8',
              border: on ? `1px solid ${meta.color}` : '1px solid #E2E8F0',
            }}
          >
            <span style={{ fontSize: '7px' }}>{on ? '●' : '○'}</span>
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
