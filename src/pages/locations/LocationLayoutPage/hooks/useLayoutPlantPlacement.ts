import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { t } from '../../../../i18n/core/t';
import type { Point } from '../../../../components/beds/layout/utils/layoutGeometry';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import { useAuth } from '../../../../shared/auth/useAuth';
import { bedKeys } from '../../../../shared/reactQuery/bedKeys';
import { plantInstanceKeys } from '../../../../shared/reactQuery/plantInstanceKeys';
import { useToast } from '../../../../shared/toast/useToast';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { PlantingToolMode } from '../../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import { buildAssociationCropsByBed } from './associationPreviewCrops';
import { evaluateStoredPlacement } from './layoutPlantingOperations';
import { useLayoutBrushPlacement } from './useLayoutBrushPlacement';
import { useLayoutMarqueeSelection } from './useLayoutMarqueeSelection';
import {
  useLayoutPalettePlacement,
  type LayoutPlacementPreview
} from './useLayoutPalettePlacement';
import { useLayoutPlantingDraft } from './useLayoutPlantingDraft';
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

  const draft = useLayoutPlantingDraft({ cropsByBed, invalidateBed });
  const effectiveCropsByBed = draft.effectiveCropsByBed;

  const evaluateStored = useCallback(
    (
      bed: ResolvedBed,
      stored: Coordinates,
      vitalRadius: number,
      ignoreCropId?: string
    ) => {
      const others = effectiveCropsByBed.get(bed.id) ?? [];
      return evaluateStoredPlacement(
        bed,
        stored,
        vitalRadius,
        others,
        ignoreCropId
      );
    },
    [effectiveCropsByBed]
  );

  const marquee = useLayoutMarqueeSelection({
    isEnabled: toolMode === 'select',
    beds,
    cropsByBed: effectiveCropsByBed,
    activeBedId,
    addCrops: draft.addCrops,
    moveCrops: draft.moveCrops,
    removeCrops: draft.removeCrops,
    onAnnounceError: (msg) => showErrorToast(null, msg)
  });

  const palette = useLayoutPalettePlacement({
    beds,
    evaluateStored,
    addCrop: draft.addCrop,
    onAnnounceError: (msg) => showErrorToast(null, msg),
    onClearSelection: marquee.clearSelection
  });

  const brush = useLayoutBrushPlacement({
    isEnabled: toolMode === 'brush',
    beds,
    cropsByBed: effectiveCropsByBed,
    activePlant: palette.activePlant,
    activeBedId,
    onAnnounceSuccess: (msg) => showSuccessToast(msg),
    onAnnounceWarning: (msg) => showToast({ message: msg, variant: 'warning' }),
    onAnnounceError: (msg) => showErrorToast(null, msg),
    addCrops: draft.addCrops
  });

  const cropDrag = useLayoutSingleCropDrag({
    bedsById,
    cropsByBed: effectiveCropsByBed,
    evaluateStored,
    moveCrop: draft.moveCrop,
    setPreview: palette.setPreview,
    onSelectSingleCrop: marquee.selectSingleCrop,
    onAnnounceError: (msg) => showErrorToast(null, msg)
  });

  const { preview: palettePreview } = palette;
  const { draggingCropId } = cropDrag;
  const { groupMovePreview } = marquee;
  const associationCropsByBed = useMemo(
    () =>
      buildAssociationCropsByBed({
        effectiveCropsByBed,
        draggingCropId,
        singlePreview: palettePreview,
        groupMovePreview
      }),
    [effectiveCropsByBed, draggingCropId, palettePreview, groupMovePreview]
  );

  const selectedCrop = useMemo(() => {
    if (marquee.selectedCropIds.size !== 1) return null;
    const id = Array.from(marquee.selectedCropIds)[0];
    for (const crops of effectiveCropsByBed.values()) {
      const found = crops.find((crop) => crop.id === id);
      if (found) return found;
    }
    return null;
  }, [marquee.selectedCropIds, effectiveCropsByBed]);

  const reset = useCallback(() => {
    palette.resetPalette();
    cropDrag.resetCropDrag();
    marquee.clearSelection();
    brush.cancelStroke();
  }, [palette, cropDrag, marquee, brush]);

  const { save: draftSave } = draft;
  const save = useCallback(async () => {
    const status = await draftSave();
    if (status === 'conflict') {
      showErrorToast(null, t('bed.placement.save_conflict'));
    } else if (status === 'error') {
      showErrorToast(null, t('bed.placement.save_error'));
    } else if (status === 'ok') {
      showSuccessToast(t('bed.placement.save_success'));
    }
  }, [draftSave, showErrorToast, showSuccessToast]);

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
    isSaving: draft.isSaving,
    hasChanges: draft.hasChanges,
    pendingCount: draft.pendingCount,
    effectiveCropsByBed,
    associationCropsByBed,
    save,
    discardChanges: draft.discardChanges,
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
