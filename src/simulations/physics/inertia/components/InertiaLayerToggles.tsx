'use client';

import type { LayerVisibility } from '../types';

interface Props {
  layers: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
}

const META: Record<keyof LayerVisibility, { label: string; color: string }> = {
  velocityArrow: { label: 'বেগ', color: '#16A34A' },
  forceArrow: { label: 'বল/ত্বরণ', color: '#EA580C' },
  distanceMarkers: { label: 'দূরত্ব', color: '#3B82F6' },
  inertiaIndicator: { label: 'জড়তা ট্যাগ', color: '#BE185D' },
};

export default function InertiaLayerToggles({ layers, onToggle }: Props) {
  const keys = Object.keys(layers) as (keyof LayerVisibility)[];
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
