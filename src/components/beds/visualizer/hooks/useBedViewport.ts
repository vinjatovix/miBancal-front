import {
  useCallback,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent
} from 'react';

import {
  animateViewportTransition,
  type ViewportCoordinates
} from '../../layout/utils/viewportTransition';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5.0;
const DEFAULT_ZOOM = 1.0;
const ZOOM_FACTOR = 1.25;

export interface BedViewportState {
  readonly zoom: number;
  readonly panX: number;
  readonly panY: number;
  readonly isDragging: boolean;
  readonly zoomPercent: number;
  readonly zoomIn: () => void;
  readonly zoomOut: () => void;
  readonly resetZoom: () => void;
  readonly fitToBounds: (
    bounds: {
      readonly minX: number;
      readonly minY: number;
      readonly maxX: number;
      readonly maxY: number;
    },
    viewBox: string,
    fillFactor?: number
  ) => void;
  readonly panBy: (dx: number, dy: number) => void;
  readonly animateTo: (
    target: ViewportCoordinates,
    durationMs?: number
  ) => void;
  readonly compensateWidthChange: (
    prevWidth: number,
    nextWidth: number
  ) => void;
  readonly onPointerDown: (e: PointerEvent<SVGSVGElement>) => void;
  readonly onPointerMove: (e: PointerEvent<SVGSVGElement>) => void;
  readonly onPointerUp: (e: PointerEvent<SVGSVGElement>) => void;
  readonly onWheel: (e: WheelEvent<SVGSVGElement>) => void;
}

export function useBedViewport(): BedViewportState {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const cancelAnimationRef = useRef<(() => void) | null>(null);
  const dragStartRef = useRef<{
    readonly x: number;
    readonly y: number;
  } | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );
  const initialPinchDistanceRef = useRef<number | null>(null);
  const pinchMidpointRef = useRef<{ x: number; y: number } | null>(null);

  const cancelActiveAnimation = useCallback(() => {
    if (cancelAnimationRef.current) {
      cancelAnimationRef.current();
      cancelAnimationRef.current = null;
    }
  }, []);

  const zoomIn = useCallback(() => {
    cancelActiveAnimation();
    setZoom((prev) =>
      Math.min(MAX_ZOOM, Number((prev * ZOOM_FACTOR).toFixed(4)))
    );
  }, [cancelActiveAnimation]);

  const zoomOut = useCallback(() => {
    cancelActiveAnimation();
    setZoom((prev) =>
      Math.max(MIN_ZOOM, Number((prev / ZOOM_FACTOR).toFixed(4)))
    );
  }, [cancelActiveAnimation]);

  const resetZoom = useCallback(() => {
    cancelActiveAnimation();
    setZoom(DEFAULT_ZOOM);
    setPanX(0);
    setPanY(0);
  }, [cancelActiveAnimation]);

  const animateTo = useCallback(
    (target: ViewportCoordinates, durationMs?: number) => {
      cancelActiveAnimation();
      cancelAnimationRef.current = animateViewportTransition(
        { zoom, panX, panY },
        target,
        {
          durationMs,
          onUpdate: (coords) => {
            setZoom(coords.zoom);
            setPanX(coords.panX);
            setPanY(coords.panY);
          },
          onComplete: () => {
            cancelAnimationRef.current = null;
          }
        }
      );
    },
    [zoom, panX, panY, cancelActiveAnimation]
  );

  const compensateWidthChange = useCallback(
    (prevWidth: number, nextWidth: number) => {
      if (prevWidth <= 0 || nextWidth <= 0 || prevWidth === nextWidth) return;
      const deltaX = (nextWidth - prevWidth) / 2;
      setPanX((prev) => Number((prev + deltaX).toFixed(2)));
    },
    []
  );

  const fitToBounds = useCallback(
    (
      bounds: {
        readonly minX: number;
        readonly minY: number;
        readonly maxX: number;
        readonly maxY: number;
      },
      viewBox: string,
      fillFactor = 0.85
    ) => {
      cancelActiveAnimation();
      const [vx, vy, vw, vh] = viewBox.split(/\s+/).map(Number);
      if ([vx, vy, vw, vh].some((value) => !Number.isFinite(value))) return;
      const boundsWidth = bounds.maxX - bounds.minX;
      const boundsHeight = bounds.maxY - bounds.minY;
      if (boundsWidth <= 0 || boundsHeight <= 0) return;

      const nextZoom = Math.min(
        MAX_ZOOM,
        Math.max(
          MIN_ZOOM,
          Number(
            (
              Math.min(vw / boundsWidth, vh / boundsHeight) * fillFactor
            ).toFixed(4)
          )
        )
      );
      const viewCenterX = vx + vw / 2;
      const viewCenterY = vy + vh / 2;
      const boundsCenterX = (bounds.minX + bounds.maxX) / 2;
      const boundsCenterY = (bounds.minY + bounds.maxY) / 2;

      setZoom(nextZoom);
      setPanX(nextZoom * (viewCenterX - boundsCenterX));
      setPanY(nextZoom * (viewCenterY - boundsCenterY));
    },
    [cancelActiveAnimation]
  );

  const panBy = useCallback((dx: number, dy: number) => {
    setPanX((prev) => prev + dx);
    setPanY((prev) => prev + dy);
  }, []);

  const onPointerDown = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      cancelActiveAnimation();
      e.currentTarget.setPointerCapture(e.pointerId);
      activePointersRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
      });

      if (activePointersRef.current.size === 2) {
        const [p1, p2] = Array.from(activePointersRef.current.values());
        initialPinchDistanceRef.current = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        pinchMidpointRef.current = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2
        };
        dragStartRef.current = null;
        return;
      }

      dragStartRef.current = { x: e.clientX, y: e.clientY };
      setIsDragging(true);
    },
    [cancelActiveAnimation]
  );

  const handlePinchMove = useCallback(
    (e: PointerEvent<SVGSVGElement>): boolean => {
      const initialDistance = initialPinchDistanceRef.current;
      if (activePointersRef.current.size !== 2 || !initialDistance) {
        return false;
      }
      const [p1, p2] = Array.from(activePointersRef.current.values());
      const currentDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const ratio = currentDistance / initialDistance;
      initialPinchDistanceRef.current = currentDistance;

      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const prevMid = pinchMidpointRef.current;
      const panDx = prevMid ? midX - prevMid.x : 0;
      const panDy = prevMid ? midY - prevMid.y : 0;
      pinchMidpointRef.current = { x: midX, y: midY };

      const rect = e.currentTarget?.getBoundingClientRect?.();
      const focusX = rect ? midX - (rect.left + rect.width / 2) : 0;
      const focusY = rect ? midY - (rect.top + rect.height / 2) : 0;

      setZoom((prev) =>
        Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, Number((prev * ratio).toFixed(4)))
        )
      );
      setPanX((prev) =>
        Number((focusX * (1 - ratio) + prev * ratio + panDx).toFixed(2))
      );
      setPanY((prev) =>
        Number((focusY * (1 - ratio) + prev * ratio + panDy).toFixed(2))
      );
      return true;
    },
    []
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      activePointersRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY
      });

      if (handlePinchMove(e)) return;

      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panBy(dx, dy);
    },
    [handlePinchMove, panBy]
  );

  const onPointerUp = useCallback((e: PointerEvent<SVGSVGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      initialPinchDistanceRef.current = null;
      pinchMidpointRef.current = null;
    }
    dragStartRef.current = null;
    setIsDragging(false);
  }, []);

  const onWheel = useCallback((e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;

    setZoom((prevZoom) => {
      const nextZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, Number((prevZoom * factor).toFixed(4)))
      );
      if (nextZoom === prevZoom) return prevZoom;

      const svg = e.currentTarget;
      if (svg && typeof svg.getBoundingClientRect === 'function') {
        const rect = svg.getBoundingClientRect();
        const cursorX = e.clientX - (rect.left + rect.width / 2);
        const cursorY = e.clientY - (rect.top + rect.height / 2);
        const ratio = nextZoom / prevZoom;
        setPanX((prevPanX) =>
          Number((cursorX * (1 - ratio) + prevPanX * ratio).toFixed(2))
        );
        setPanY((prevPanY) =>
          Number((cursorY * (1 - ratio) + prevPanY * ratio).toFixed(2))
        );
      }

      return nextZoom;
    });
  }, []);

  return {
    zoom,
    panX,
    panY,
    isDragging,
    zoomPercent: Math.round(zoom * 100),
    zoomIn,
    zoomOut,
    resetZoom,
    fitToBounds,
    panBy,
    animateTo,
    compensateWidthChange,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel
  };
}
