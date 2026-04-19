'use client';

import { useState, useCallback, useRef, useEffect, type RefObject } from 'react';

// ─────────────────────────────────────────────
// usePanZoom - Google Maps / Figma style pan & zoom
//
// Key behavior:
// • Wheel zoom: zooms toward mouse cursor position
// • Pinch zoom: zooms toward midpoint of two fingers
// • Toolbar +/−: zooms toward viewport center
// • Fit button: auto-fit canvas to viewport
// • Works on desktop (wheel) AND mobile (pinch)
// ─────────────────────────────────────────────

export interface PanZoomState {
  panX: number;
  panY: number;
  zoom: number;
}

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 5.0;
const ZOOM_SENSITIVITY = 0.001; // wheel delta multiplier
const ZOOM_STEP = 0.1;          // toolbar button step
const FIT_PADDING = 0.05;

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

  // ── Panning state ──
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  // ── Pinch-to-zoom state (mobile) ──
  const pinchState = useRef<{
    active: boolean;
    startDist: number;
    startZoom: number;
    midX: number;
    midY: number;
    pointerId1: number;
    pointerId2: number;
    pointers: Map<number, { x: number; y: number }>;
  }>({
    active: false,
    startDist: 0,
    startZoom: 1,
    midX: 0,
    midY: 0,
    pointerId1: -1,
    pointerId2: -1,
    pointers: new Map(),
  });

  // ── Auto-fit on mount ──
  useEffect(() => {
    if (!containerRef?.current || !canvasSize) return;
    const fit = calculateFit(containerRef.current, canvasSize);
    setState(fit);
  }, [containerRef, canvasSize]);

  // ── Helper: get cursor position relative to viewport ──
  const getCursorInViewport = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef?.current) return { x: clientX, y: clientY };
      const rect = containerRef.current.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [containerRef],
  );

  // ── Core: zoom toward a specific viewport point ──
  const zoomToward = useCallback(
    (viewportX: number, viewportY: number, newZoom: number) => {
      setState((prev) => {
        const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
        const zoomRatio = clampedZoom / prev.zoom;

        // The point under the cursor in canvas coords stays fixed:
        // viewportX = canvasX * zoom + panX
        // After zoom: viewportX = canvasX * newZoom + newPanX
        // So: newPanX = viewportX - (viewportX - panX) * zoomRatio
        const newPanX = viewportX - (viewportX - prev.panX) * zoomRatio;
        const newPanY = viewportY - (viewportY - prev.panY) * zoomRatio;

        return { panX: newPanX, panY: newPanY, zoom: clampedZoom };
      });
    },
    [],
  );

  // ── Pointer events (pan + pinch) ──
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const ps = pinchState.current;
      ps.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (ps.pointers.size === 2) {
        // Start pinch-to-zoom
        const [p1, p2] = Array.from(ps.pointers.entries());
        ps.active = true;
        ps.pointerId1 = p1[0];
        ps.pointerId2 = p2[0];
        ps.startDist = getDistance(p1[1], p2[1]);
        ps.startZoom = state.zoom;
        const mid = getMidpoint(p1[1], p2[1]);
        const vp = getCursorInViewport(mid.x, mid.y);
        ps.midX = vp.x;
        ps.midY = vp.y;
        isPanning.current = false;
      } else if (ps.pointers.size === 1) {
        // Start panning
        isPanning.current = true;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [state.zoom, getCursorInViewport],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const ps = pinchState.current;
      ps.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (ps.active && ps.pointers.size >= 2) {
        // Pinch-to-zoom
        const p1 = ps.pointers.get(ps.pointerId1);
        const p2 = ps.pointers.get(ps.pointerId2);
        if (!p1 || !p2) return;

        const currentDist = getDistance(p1, p2);
        const scale = currentDist / ps.startDist;
        const newZoom = ps.startZoom * scale;

        zoomToward(ps.midX, ps.midY, newZoom);
      } else if (isPanning.current) {
        // Panning
        const dx = e.clientX - lastPointer.current.x;
        const dy = e.clientY - lastPointer.current.y;
        lastPointer.current = { x: e.clientX, y: e.clientY };
        setState((prev) => ({
          ...prev,
          panX: prev.panX + dx,
          panY: prev.panY + dy,
        }));
      }
    },
    [zoomToward],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const ps = pinchState.current;
    ps.pointers.delete(e.pointerId);

    if (ps.active) {
      ps.active = false;
      // If one finger remains, start panning from that finger
      if (ps.pointers.size === 1) {
        const remaining = Array.from(ps.pointers.entries())[0];
        isPanning.current = true;
        lastPointer.current = { x: remaining[1].x, y: remaining[1].y };
      }
    }

    if (ps.pointers.size === 0) {
      isPanning.current = false;
    }
  }, []);

  // ── Wheel zoom (desktop) - zooms toward cursor ──
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const cursor = getCursorInViewport(e.clientX, e.clientY);

      // Smooth zoom: larger delta = larger zoom change
      const delta = -e.deltaY * ZOOM_SENSITIVITY;
      setState((prev) => {
        const newZoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, prev.zoom * (1 + delta)),
        );
        const zoomRatio = newZoom / prev.zoom;
        const newPanX = cursor.x - (cursor.x - prev.panX) * zoomRatio;
        const newPanY = cursor.y - (cursor.y - prev.panY) * zoomRatio;
        return { panX: newPanX, panY: newPanY, zoom: newZoom };
      });
    },
    [getCursorInViewport],
  );

  // ── Toolbar buttons: zoom toward viewport center ──
  const zoomIn = useCallback(() => {
    if (!containerRef?.current) {
      setState((prev) => ({ ...prev, zoom: Math.min(MAX_ZOOM, prev.zoom + ZOOM_STEP) }));
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    zoomToward(rect.width / 2, rect.height / 2, state.zoom + ZOOM_STEP);
  }, [containerRef, state.zoom, zoomToward]);

  const zoomOut = useCallback(() => {
    if (!containerRef?.current) {
      setState((prev) => ({ ...prev, zoom: Math.max(MIN_ZOOM, prev.zoom - ZOOM_STEP) }));
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    zoomToward(rect.width / 2, rect.height / 2, state.zoom - ZOOM_STEP);
  }, [containerRef, state.zoom, zoomToward]);

  // ── Fit to screen ──
  const fitToScreen = useCallback(() => {
    if (!containerRef?.current || !canvasSize) {
      setState({ panX: 0, panY: 0, zoom: defaultZoom });
      return;
    }
    setState(calculateFit(containerRef.current, canvasSize));
  }, [containerRef, canvasSize, defaultZoom]);

  // ── Prevent browser pinch-zoom on the container ──
  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length >= 2) e.preventDefault();
    };

    el.addEventListener('touchmove', preventDefault, { passive: false });
    return () => el.removeEventListener('touchmove', preventDefault);
  }, [containerRef]);

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

// ── Utilities ──

function getDistance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function getMidpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function calculateFit(
  container: HTMLElement,
  canvasSize: { width: number; height: number },
): PanZoomState {
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const scaleX = cw / canvasSize.width;
  const scaleY = ch / canvasSize.height;
  const zoom = Math.min(scaleX, scaleY) * (1 - FIT_PADDING * 2);
  const scaledW = canvasSize.width * zoom;
  const scaledH = canvasSize.height * zoom;
  const panX = (cw - scaledW) / 2;
  const panY = (ch - scaledH) / 2;
  return { panX, panY, zoom };
}
