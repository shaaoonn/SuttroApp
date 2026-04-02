'use client';

import { useRef, useState, type PointerEvent, type ReactNode } from 'react';

// ─────────────────────────────────────────────
// SimObject — Draggable simulation object base
// Use in Mouse mode to make elements movable
// ─────────────────────────────────────────────

interface SimObjectProps {
  x: number;
  y: number;
  onMove?: (x: number, y: number) => void;
  draggable?: boolean;
  children: ReactNode;
  className?: string;
}

export default function SimObject({
  x,
  y,
  onMove,
  draggable = true,
  children,
  className = '',
}: SimObjectProps) {
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  const onPointerDown = (e: PointerEvent) => {
    if (!draggable) return;
    e.stopPropagation();
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
        cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default',
        zIndex: isDragging ? 10 : 1,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {children}
    </div>
  );
}
