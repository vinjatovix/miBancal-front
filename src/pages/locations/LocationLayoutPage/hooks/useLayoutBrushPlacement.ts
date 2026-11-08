import { useCallback, useEffect, useMemo, useState } from 'react';

import { t } from '../../../../i18n/core/t';
import type { Point } from '../../../../components/beds/layout/utils/layoutGeometry';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import {
  findBedAtPoint,
  globalToBedLocal
} from '../../../../components/beds/layout/utils/plantPlacementGeometry';
import {
  calculateDirectrix,
  evaluatePermissiveBrushPlacement,
  generateDoubleRowPositions,
  generateSingleRowPositions,
  generateStaggeredTrianglePositions,
  resolveBrushStepSpacing
} from '../../../../components/beds/visualizer/utils/brushGeometry';
import {
  calculateVitalRadius,
  type SpatialCrop
} from '../../../../components/beds/visualizer/utils/spatialCollisions';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type {
  BrushCandidatePosition,
  BrushPatternType
} from '../../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import type { PlantListItem } from '../../../../types/Plants/Plant';
import { batchCreateCrops } from './layoutPlantingOperations';

export interface UseLayoutBrushPlacementParams {
  readonly isEnabled: boolean;
  readonly beds: readonly ResolvedBed[];
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly activePlant: PlantListItem | null;
  readonly activeBedId: string | null;
  readonly onAnnounceSuccess: (message: string) => void;
  readonly onAnnounceWarning: (message: string) => void;
  readonly onAnnounceError: (message: string) => void;
  readonly invalidateBed: (bedId: string) => Promise<void>;
}

export function useLayoutBrushPlacement({
  isEnabled,
  beds,
  cropsByBed,
  activePlant,
  activeBedId,
  onAnnounceSuccess,
  onAnnounceWarning,
  onAnnounceError,
  invalidateBed
}: UseLayoutBrushPlacementParams) {
  const [brushPattern, setBrushPattern] =
    useState<BrushPatternType>('single-row');
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeBed, setStrokeBed] = useState<ResolvedBed | null>(null);
  const [startPoint, setStartPoint] = useState<Coordinates | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Coordinates | null>(null);

  const cancelStroke = useCallback(() => {
    setIsDrawing(false);
    setStrokeBed(null);
    setStartPoint(null);
    setCurrentPoint(null);
  }, []);

  useEffect(() => {
    if (!isDrawing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelStroke();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing, cancelStroke]);

  const directrix = useMemo(() => {
    if (!startPoint || !currentPoint) return null;
    return calculateDirectrix(startPoint, currentPoint);
  }, [startPoint, currentPoint]);

  const rawPositions = useMemo(() => {
    if (!directrix || !activePlant) return [];
    const spacing = resolveBrushStepSpacing(activePlant.traits.spacingCm?.min);
    if (brushPattern === 'double-row') {
      return generateDoubleRowPositions(directrix, spacing);
    }
    if (brushPattern === 'staggered-triangle') {
      return generateStaggeredTrianglePositions(directrix, spacing);
    }
    return generateSingleRowPositions(directrix, spacing);
  }, [directrix, activePlant, brushPattern]);

  const candidates = useMemo((): readonly BrushCandidatePosition[] => {
    if (rawPositions.length === 0 || !activePlant || !strokeBed) return [];
    const crops = cropsByBed.get(strokeBed.id) ?? [];
    const spatialCrops: SpatialCrop[] = crops.map((c) => ({
      id: c.id,
      x: c.position.x,
      y: c.position.y,
      vitalRadius: c.vitalRadius
    }));
    const vitalRadius = calculateVitalRadius(activePlant.traits.spacingCm?.min);
    const result = evaluatePermissiveBrushPlacement({
      rawPositions,
      vitalRadius,
      existingCrops: spatialCrops,
      bedDimensions: { width: strokeBed.width, height: strokeBed.height }
    });
    return result.candidates;
  }, [rawPositions, activePlant, strokeBed, cropsByBed]);

  const handlePointerDown = useCallback(
    (global: Point) => {
      if (!isEnabled) return;
      const hitBed = findBedAtPoint(beds, global);
      if (!hitBed) return;
      if (activeBedId && hitBed.id !== activeBedId) return;
      if (!activePlant) {
        onAnnounceError(t('bed.placement.brush_requires_plant'));
        return;
      }
      const targetBed = hitBed;
      const local = globalToBedLocal(targetBed, global);
      setStrokeBed(targetBed);
      setStartPoint(local);
      setCurrentPoint(local);
      setIsDrawing(true);
    },
    [isEnabled, activePlant, activeBedId, beds, onAnnounceError]
  );

  const handlePointerMove = useCallback(
    (global: Point) => {
      if (!isDrawing || !strokeBed) return;
      const local = globalToBedLocal(strokeBed, global);
      setCurrentPoint(local);
    },
    [isDrawing, strokeBed]
  );

  const handlePointerUp = useCallback(async () => {
    if (
      !isDrawing ||
      !strokeBed ||
      !startPoint ||
      !currentPoint ||
      !activePlant ||
      !directrix
    ) {
      cancelStroke();
      return;
    }

    const crops = cropsByBed.get(strokeBed.id) ?? [];
    const spatialCrops: SpatialCrop[] = crops.map((c) => ({
      id: c.id,
      x: c.position.x,
      y: c.position.y,
      vitalRadius: c.vitalRadius
    }));
    const vitalRadius = calculateVitalRadius(activePlant.traits.spacingCm?.min);
    const result = evaluatePermissiveBrushPlacement({
      rawPositions,
      vitalRadius,
      existingCrops: spatialCrops,
      bedDimensions: { width: strokeBed.width, height: strokeBed.height }
    });

    if (result.accepted.length > 0) {
      await batchCreateCrops(
        strokeBed.id,
        result.accepted.map((pos) => ({
          plantId: activePlant.id,
          position: pos
        }))
      );
      await invalidateBed(strokeBed.id);
    }

    if (result.plantedCount === 0) {
      onAnnounceWarning(t('bed.placement.brush_result_none'));
    } else if (result.omittedCount > 0) {
      onAnnounceWarning(
        t('bed.placement.brush_result_summary', {
          planted: String(result.plantedCount),
          total: String(rawPositions.length),
          omitted: String(result.omittedCount)
        })
      );
    } else {
      onAnnounceSuccess(
        t('bed.placement.brush_result_all', {
          planted: String(result.plantedCount)
        })
      );
    }

    cancelStroke();
  }, [
    isDrawing,
    strokeBed,
    startPoint,
    currentPoint,
    activePlant,
    directrix,
    cropsByBed,
    rawPositions,
    invalidateBed,
    onAnnounceSuccess,
    onAnnounceWarning,
    cancelStroke
  ]);

  return {
    brushPattern,
    setBrushPattern,
    isDrawing,
    strokeBedId: strokeBed?.id ?? null,
    directrix,
    candidates,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    cancelStroke
  };
}
