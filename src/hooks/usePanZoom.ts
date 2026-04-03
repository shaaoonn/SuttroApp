'use client';

import { useState, useCallback, useRef, useEffect, type PointerEvent, type WheelEvent, type RefObject } from 'react';

export interface PanZoomState {
  panX: number;
  panY: number;
  zoom: number;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4.0;
const ZOOM_STEP = 0.1;
const FIT_PADDING = 0.05; // 5% padding on each side

export function usePanZoom(
  defaultZoom = 1.0,
  canvasSize?: { width: number; height: number },
  containerRef?: RefObject<HTMLDivElement | null>,
) {
  const [state, setState] = useState<PanZoomState>({
    panX: 0,
    panY: 0,
    zoom: defaultZoom,
  });

  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // Auto-fit on mount when container and canvas size are known
  useEffect(() => {
    if (!containerRef?.current || !canvasSize) return;

    const fit = calculateFit(containerRef.current, canvasSize);
    setState(fit);
  }, [containerRef, canvasSize]);

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
    if (!containerRef?.current || !canvasSize) {
      setState({ panX: 0, panY: 0, zoom: defaultZoom });
      return;
    }
    const fit = calculateFit(containerRef.current, canvasSize);
    setState(fit);
  }, [containerRef, canvasSize, defaultZoom]);

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

/** Calculate zoom and pan to fit canvas inside container with padding */
function calculateFit(
  container: HTMLElement,
  canvasSize: { width: number; height: number },
): PanZoomState {
  const cw = container.clientWidth;
  const ch = container.clientHeight;

  const scaleX = cw / canvasSize.width;
  const scaleY = ch / canvasSize.height;

  // Fit the whole canvas with padding
  const zoom = Math.min(scaleX, scaleY) * (1 - FIT_PADDING * 2);

  // Center the canvas in the viewport
  const scaledW = canvasSize.width * zoom;
  const scaledH = canvasSize.height * zoom;
  const panX = (cw - scaledW) / 2;
  const panY = (ch - scaledH) / 2;

  return { panX, panY, zoom };
}
