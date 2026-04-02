'use client';

import { useState, useCallback, useRef, type PointerEvent, type WheelEvent } from 'react';

export interface PanZoomState {
  panX: number;
  panY: number;
  zoom: number;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4.0;
const ZOOM_STEP = 0.1;

export function usePanZoom(defaultZoom = 1.0) {
  const [state, setState] = useState<PanZoomState>({
    panX: 0,
    panY: 0,
    zoom: defaultZoom,
  });

  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: PointerEvent) => {
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setState((prev) => ({
      ...prev,
      panX: prev.panX + dx,
      panY: prev.panY + dy,
    }));
  }, []);

  const onPointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setState((prev) => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom + delta)),
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(MIN_ZOOM, prev.zoom - ZOOM_STEP),
    }));
  }, []);

  const fitToScreen = useCallback(() => {
    setState({ panX: 0, panY: 0, zoom: defaultZoom });
  }, [defaultZoom]);

  const transformStyle = {
    transform: `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`,
    transformOrigin: '0 0' as const,
  };

  return {
    ...state,
    transformStyle,
    zoomIn,
    zoomOut,
    fitToScreen,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onWheel,
    },
  };
}
