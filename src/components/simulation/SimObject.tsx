'use client';

import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

// ─────────────────────────────────────────────
// SimObject — Draggable simulation object
// Only draggable in Mouse mode.
// In Hand mode, clicks pass through to pan/zoom.
// ─────────────────────────────────────────────

interface SimObjectProps {
  x: number;
  y: number;
  onMove?: (x: number, y: number) => void;
  /** Is this object draggable? (only works in mouse mode) */
  draggable?: boolean;
  /** Current interaction mode */
  mode?: 'mouse' | 'hand';
  /** Click handler for selection */
  onSelect?: () => void;
  /** Whether this object is currently selected */
  selected?: boolean;
  /** Label shown below the object */
  label?: string;
  children: ReactNode;
  className?: string;
}

export default function SimObject({
  x,
  y,
  onMove,
  draggable = true,
  mode = 'mouse',
  onSelect,
  selected = false,
  label,
  children,
  className = '',
}: SimObjectProps) {
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const canDrag = draggable && mode === 'mouse';

  const onPointerDown = (e: PointerEvent) => {
    if (mode !== 'mouse') return;
    e.stopPropagation();
    onSelect?.();

    if (!canDrag) return;
    setIsDragging(true);
    offset.current = { x: e.clientX - x, y: e.clientY - y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging || !onMove) return;
    onMove(e.clientX - offset.current.x, e.clientY - offset.current.y);
  };

  const onPointerUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`absolute ${className}`}
      style={{
        left: x,
        top: y,
        cursor:
          mode === 'hand'
            ? 'inherit'
            : canDrag
              ? isDragging
                ? 'grabbing'
                : 'grab'
              : 'pointer',
        zIndex: isDragging ? 10 : 1,
        outline: selected ? '2px solid var(--suttro-accent)' : 'none',
        outlineOffset: 4,
        borderRadius: 4,
        // In hand mode, let pointer events pass through to canvas
        pointerEvents: mode === 'hand' ? 'none' : 'auto',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
      {label && (
        <div
          className="text-center text-xs mt-1 whitespace-nowrap"
          style={{ color: 'var(--canvas-label)' }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
