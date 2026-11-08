import {
  useCallback,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent
} from 'react';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5.0;
const DEFAULT_ZOOM = 1.0;
const ZOOM_FACTOR = 1.25;

export interface BedViewportState {
  readonly zoom: number;
  readonly panX: number;
  readonly panY: number;
  readonly isDragging: boolean;
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

  const dragStartRef = useRef<{
    readonly x: number;
    readonly y: number;
  } | null>(null);

  const zoomIn = useCallback(() => {
    setZoom((prev) =>
      Math.min(MAX_ZOOM, Number((prev * ZOOM_FACTOR).toFixed(4)))
    );
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((prev) =>
      Math.max(MIN_ZOOM, Number((prev / ZOOM_FACTOR).toFixed(4)))
    );
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(DEFAULT_ZOOM);
    setPanX(0);
    setPanY(0);
  }, []);

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
    []
  );

  const panBy = useCallback((dx: number, dy: number) => {
    setPanX((prev) => prev + dx);
    setPanY((prev) => prev + dy);
  }, []);

  const onPointerDown = useCallback((e: PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      panBy(dx, dy);
    },
    [panBy]
  );

  const onPointerUp = useCallback((e: PointerEvent<SVGSVGElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragStartRef.current = null;
    setIsDragging(false);
  }, []);

  const onWheel = useCallback((e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(MAX_ZOOM, Number((prev * 1.1).toFixed(4))));
    } else if (e.deltaY > 0) {
      setZoom((prev) => Math.max(MIN_ZOOM, Number((prev / 1.1).toFixed(4))));
    }
  }, []);

  return {
    zoom,
    panX,
    panY,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToBounds,
    panBy,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onWheel
  };
}
