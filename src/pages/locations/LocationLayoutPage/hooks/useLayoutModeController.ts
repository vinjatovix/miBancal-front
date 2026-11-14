import { useCallback, useState } from 'react';

import {
  calculateFitBounds,
  rectAabb
} from '../../../../components/beds/layout/utils/layoutGeometry';
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
  return calculateFitBounds(rectAabb(bed), viewBox, fillFactor);
}

export function useLayoutModeController({
  viewport,
  beds,
  viewBox,
  initialMode = 'read',
  onModeChange
}: UseLayoutModeControllerParams): LayoutModeController {
  const [mode, setMode] = useState<LayoutMode>(initialMode);

  const changeMode = useCallback(
    (next: LayoutMode) => {
      setMode(next);
      onModeChange?.(next);
    },
    [onModeChange]
  );

  const enterPlanting = useCallback(
    (bedId: string | null) => {
      setMode('plants');
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
    setMode: changeMode,
    enterPlanting
  };
}
