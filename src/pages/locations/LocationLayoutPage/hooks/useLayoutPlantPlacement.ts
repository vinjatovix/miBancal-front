import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { Point } from '../../../../components/beds/layout/utils/layoutGeometry';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import { useAuth } from '../../../../shared/auth/useAuth';
import { bedKeys } from '../../../../shared/reactQuery/bedKeys';
import { plantInstanceKeys } from '../../../../shared/reactQuery/plantInstanceKeys';
import { useToast } from '../../../../shared/toast/useToast';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { PlantingToolMode } from '../../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import { evaluateStoredPlacement } from './layoutPlantingOperations';
import { useLayoutBrushPlacement } from './useLayoutBrushPlacement';
import { useLayoutMarqueeSelection } from './useLayoutMarqueeSelection';
import {
  useLayoutPalettePlacement,
  type LayoutPlacementPreview
} from './useLayoutPalettePlacement';
import { useLayoutSingleCropDrag } from './useLayoutSingleCropDrag';

export type { LayoutPlacementPreview };

export interface UseLayoutPlantPlacementParams {
  readonly beds: readonly ResolvedBed[];
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly activeBedId?: string | null;
}

export function useLayoutPlantPlacement({
  beds,
  cropsByBed,
  activeBedId = null
}: UseLayoutPlantPlacementParams) {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast, showToast } = useToast();

  const [toolMode, setToolMode] = useState<PlantingToolMode>('plant-single');
  const [isSaving, setIsSaving] = useState(false);

  const bedsById = useMemo(() => {
    const map = new Map<string, ResolvedBed>();
    for (const bed of beds) map.set(bed.id, bed);
    return map;
  }, [beds]);

  const invalidateBed = useCallback(
    async (bedId: string) => {
      await queryClient.invalidateQueries({
        queryKey: plantInstanceKeys.byBed(userId, bedId)
      });
      await queryClient.invalidateQueries({
        queryKey: bedKeys.detail(userId, bedId)
      });
    },
    [queryClient, userId]
  );

  const evaluateStored = useCallback(
    (
      bed: ResolvedBed,
      stored: Coordinates,
      vitalRadius: number,
      ignoreCropId?: string
    ) => {
      const others = cropsByBed.get(bed.id) ?? [];
      return evaluateStoredPlacement(
        bed,
        stored,
        vitalRadius,
        others,
        ignoreCropId
      );
    },
    [cropsByBed]
  );

  const marquee = useLayoutMarqueeSelection({
    isEnabled: toolMode === 'select',
    beds,
    cropsByBed,
    activeBedId,
    invalidateBed,
    onAnnounceError: (msg) => showErrorToast(null, msg)
  });

  const palette = useLayoutPalettePlacement({
    beds,
    evaluateStored,
    invalidateBed,
    setIsSaving,
    onAnnounceError: (msg) => showErrorToast(null, msg),
    onClearSelection: marquee.clearSelection
  });

  const brush = useLayoutBrushPlacement({
    isEnabled: toolMode === 'brush',
    beds,
    cropsByBed,
    activePlant: palette.activePlant,
    activeBedId,
    onAnnounceSuccess: (msg) => showSuccessToast(msg),
    onAnnounceWarning: (msg) => showToast({ message: msg, variant: 'warning' }),
    onAnnounceError: (msg) => showErrorToast(null, msg),
    invalidateBed
  });

  const cropDrag = useLayoutSingleCropDrag({
    bedsById,
    cropsByBed,
    evaluateStored,
    invalidateBed,
    setPreview: palette.setPreview,
    onSelectSingleCrop: marquee.selectSingleCrop,
    setIsSaving,
    onAnnounceError: (msg) => showErrorToast(null, msg)
  });

  const selectedCrop = useMemo(() => {
    if (marquee.selectedCropIds.size !== 1) return null;
    const id = Array.from(marquee.selectedCropIds)[0];
    for (const crops of cropsByBed.values()) {
      const found = crops.find((crop) => crop.id === id);
      if (found) return found;
    }
    return null;
  }, [marquee.selectedCropIds, cropsByBed]);

  const reset = useCallback(() => {
    palette.resetPalette();
    cropDrag.resetCropDrag();
    marquee.clearSelection();
    brush.cancelStroke();
  }, [palette, cropDrag, marquee, brush]);

  return {
    toolMode,
    setToolMode,
    brushPattern: brush.brushPattern,
    setBrushPattern: brush.setBrushPattern,
    brush,
    marquee,
    activePlant: palette.activePlant,
    activePlantId: palette.activePlantId,
    activePlantName: palette.activePlantName,
    selectedCropId: selectedCrop?.id ?? null,
    selectedCropIds: marquee.selectedCropIds,
    selectedCropCount: marquee.selectedCropCount,
    selectedCrop,
    preview: palette.preview,
    isSaving,
    selectPalettePlant: palette.selectPalettePlant,
    cancelPalettePlant: palette.cancelPalettePlant,
    dragPalettePlant: palette.dragPalettePlant,
    updateDropPreview: palette.updateDropPreview,
    clearPreview: palette.clearPreview,
    dropPlant: palette.dropPlant,
    tapPlace: (g: Point) => {
      if (toolMode === 'plant-single') palette.tapPlace(g);
    },
    selectCrop: marquee.selectSingleCrop,
    toggleCropSelection: marquee.toggleCropSelection,
    clearSelection: marquee.clearSelection,
    deleteSelectedCrops: marquee.deleteSelectedCrops,
    duplicateSelectedCrops: marquee.duplicateSelectedCrops,
    beginCropDrag: cropDrag.beginCropDrag,
    moveCropDrag: cropDrag.moveCropDrag,
    endCropDrag: cropDrag.endCropDrag,
    removeCrop: (crop: CropPlacementItem) => {
      marquee.selectSingleCrop(crop.id);
      void marquee.deleteSelectedCrops();
    },
    reset
  };
}
