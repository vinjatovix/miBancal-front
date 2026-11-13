import { useCallback, useEffect, useMemo, useState } from 'react';
import type React from 'react';

import { t } from '../../../../i18n/core/t';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type {
  BatchCropCreationItem,
  BrushCandidatePosition,
  BrushDirectrix,
  BrushPatternType,
  PlantPlacementInput
} from '../../../../types/PlantInstance/brushSelectionTypes';
import {
  calculateDirectrix,
  evaluatePermissiveBrushPlacement,
  generateDoubleRowPositions,
  generateSingleRowPositions,
  generateStaggeredTrianglePositions,
  resolveBrushSpacing
} from '../utils/brushGeometry';
import {
  calculateVitalRadius,
  type SpatialCrop
} from '../utils/spatialCollisions';

export interface UseCanvasBrushStrokeParams {
  readonly isEnabled: boolean;
  readonly activeBrushPattern: BrushPatternType;
  readonly activePlant: PlantPlacementInput | null;
  readonly existingCrops: readonly SpatialCrop[];
  readonly bedDimensions: { readonly width: number; readonly height: number };
  readonly onApplyBrush: (items: readonly BatchCropCreationItem[]) => void;
  readonly onAnnounce: (message: string) => void;
  readonly screenToBedCoordinates: (
    clientX: number,
    clientY: number
  ) => Coordinates | null;
}

export interface UseCanvasBrushStrokeResult {
  readonly isDrawing: boolean;
  readonly directrix: BrushDirectrix | null;
  readonly candidates: readonly BrushCandidatePosition[];
  readonly handlePointerDown: (e: React.PointerEvent) => void;
  readonly handlePointerMove: (e: React.PointerEvent) => void;
  readonly handlePointerUp: (e: React.PointerEvent) => void;
  readonly cancelStroke: () => void;
}

export function useCanvasBrushStroke({
  isEnabled,
  activeBrushPattern,
  activePlant,
  existingCrops,
  bedDimensions,
  onApplyBrush,
  onAnnounce,
  screenToBedCoordinates
}: UseCanvasBrushStrokeParams): UseCanvasBrushStrokeResult {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Coordinates | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Coordinates | null>(null);

  const cancelStroke = useCallback(() => {
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPoint(null);
  }, []);

  useEffect(() => {
    if (!isDrawing) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        cancelStroke();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawing, cancelStroke]);

  const directrix = useMemo(() => {
    if (!startPoint || !currentPoint) {
      return null;
    }
    return calculateDirectrix(startPoint, currentPoint);
  }, [startPoint, currentPoint]);

  const rawPositions = useMemo(() => {
    if (!directrix || !activePlant) {
      return [];
    }

    const spacing = resolveBrushSpacing(activePlant.spacingCmMin);
    if (activeBrushPattern === 'double-row') {
      return generateDoubleRowPositions(directrix, spacing);
    }
    if (activeBrushPattern === 'staggered-triangle') {
      return generateStaggeredTrianglePositions(directrix, spacing);
    }
    return generateSingleRowPositions(directrix, spacing);
  }, [directrix, activePlant, activeBrushPattern]);

  const candidates = useMemo(() => {
    if (rawPositions.length === 0 || !activePlant) {
      return [];
    }

    const vitalRadius = calculateVitalRadius(activePlant.spacingCmMin);
    const result = evaluatePermissiveBrushPlacement({
      rawPositions,
      vitalRadius,
      existingCrops,
      bedDimensions
    });

    return result.candidates;
  }, [rawPositions, activePlant, existingCrops, bedDimensions]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isEnabled || e.button !== 0) {
        return;
      }

      if (!activePlant) {
        onAnnounce(t('bed.placement.brush_requires_plant'));
        return;
      }

      const coords = screenToBedCoordinates(e.clientX, e.clientY);
      if (!coords) {
        return;
      }

      (e.target as Element).setPointerCapture?.(e.pointerId);
      setStartPoint(coords);
      setCurrentPoint(coords);
      setIsDrawing(true);
    },
    [isEnabled, activePlant, onAnnounce, screenToBedCoordinates]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing || !startPoint) {
        return;
      }

      const coords = screenToBedCoordinates(e.clientX, e.clientY);
      if (!coords) {
        return;
      }

      setCurrentPoint(coords);
    },
    [isDrawing, startPoint, screenToBedCoordinates]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing || !startPoint || !activePlant || !directrix) {
        cancelStroke();
        return;
      }

      (e.target as Element).releasePointerCapture?.(e.pointerId);

      const spacing = resolveBrushSpacing(activePlant.spacingCmMin);
      if (directrix.lengthCm < spacing) {
        onAnnounce(
          t('bed.placement.brush_short_stroke', {
            spacing: String(spacing)
          })
        );
      }

      const vitalRadius = calculateVitalRadius(activePlant.spacingCmMin);
      const result = evaluatePermissiveBrushPlacement({
        rawPositions,
        vitalRadius,
        existingCrops,
        bedDimensions
      });

      if (result.accepted.length > 0) {
        const batchItems: BatchCropCreationItem[] = result.accepted.map(
          (pos) => ({
            plant: activePlant,
            position: pos
          })
        );
        onApplyBrush(batchItems);
      }

      onAnnounce(
        t('bed.placement.brush_result_summary', {
          planted: String(result.plantedCount),
          total: String(rawPositions.length),
          omitted: String(result.omittedCount)
        })
      );

      cancelStroke();
    },
    [
      isDrawing,
      startPoint,
      activePlant,
      directrix,
      rawPositions,
      existingCrops,
      bedDimensions,
      onAnnounce,
      onApplyBrush,
      cancelStroke
    ]
  );

  return {
    isDrawing,
    directrix,
    candidates,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    cancelStroke
  };
}
