import { useCallback, useState } from 'react';

import { rotatedRectVertices } from '../../../../components/beds/layout/utils/layoutGeometry';
import type {
  LayoutMode,
  ResolvedBed
} from '../../../../components/beds/layout/utils/layoutTypes';
import type { ViewportCoordinates } from '../../../../components/beds/layout/utils/viewportTransition';

export interface ViewportAnimator {
  readonly animateTo: (
    target: ViewportCoordinates,
    durationMs?: number
  ) => void;
}

export interface UseLayoutModeControllerParams {
  readonly viewport: ViewportAnimator;
  readonly beds: readonly ResolvedBed[];
  readonly viewBox: string;
  readonly initialMode?: LayoutMode;
  readonly onModeChange?: (mode: LayoutMode) => void;
}

export interface LayoutModeController {
  readonly mode: LayoutMode;
  readonly setMode: (next: LayoutMode) => void;
  readonly enterPlanting: (bedId: string | null) => void;
}

function computeBedTarget(
  bed: ResolvedBed,
  viewBox: string,
  fillFactor = 0.8
): ViewportCoordinates | null {
  const vertices = rotatedRectVertices(bed);
  const xs = vertices.map((v) => v.x);
  const ys = vertices.map((v) => v.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const [vx, vy, vw, vh] = viewBox.split(/\s+/).map(Number);
  if ([vx, vy, vw, vh].some((n) => !Number.isFinite(n))) return null;

  const boundsWidth = maxX - minX;
  const boundsHeight = maxY - minY;
  if (boundsWidth <= 0 || boundsHeight <= 0) return null;

  const zoom = Math.min(
    5.0,
    Math.max(
      0.25,
      Number(
        (Math.min(vw / boundsWidth, vh / boundsHeight) * fillFactor).toFixed(4)
      )
    )
  );
  const viewCenterX = vx + vw / 2;
  const viewCenterY = vy + vh / 2;
  const boundsCenterX = (minX + maxX) / 2;
  const boundsCenterY = (minY + maxY) / 2;

  return {
    zoom,
    panX: Number((zoom * (viewCenterX - boundsCenterX)).toFixed(2)),
    panY: Number((zoom * (viewCenterY - boundsCenterY)).toFixed(2))
  };
}

export function useLayoutModeController({
  viewport,
  beds,
  viewBox,
  initialMode = 'read',
  onModeChange
}: UseLayoutModeControllerParams): LayoutModeController {
  const [mode, setModeState] = useState<LayoutMode>(initialMode);

  const setMode = useCallback(
    (next: LayoutMode) => {
      setModeState(next);
      onModeChange?.(next);
    },
    [onModeChange]
  );

  const enterPlanting = useCallback(
    (bedId: string | null) => {
      setModeState('plants');
      onModeChange?.('plants');

      if (!bedId) return;
      const targetBed = beds.find((b) => b.id === bedId);
      if (!targetBed) return;

      const target = computeBedTarget(targetBed, viewBox);
      if (target) {
        viewport.animateTo(target);
      }
    },
    [beds, viewBox, viewport, onModeChange]
  );

  return {
    mode,
    setMode,
    enterPlanting
  };
}
