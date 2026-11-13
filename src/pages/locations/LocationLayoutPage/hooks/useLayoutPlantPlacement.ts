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
import { useLayoutPalettePlacement } from './useLayoutPalettePlacement';
import { useLayoutPlantingDraft } from './useLayoutPlantingDraft';
import { useLayoutPlantingHistory } from './useLayoutPlantingHistory';
import { useLayoutSingleCropDrag } from './useLayoutSingleCropDrag';

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

  const history = useLayoutPlantingHistory(draft, effectiveCropsByBed);

  const marquee = useLayoutMarqueeSelection({
    isEnabled: toolMode === 'select',
    beds,
    cropsByBed: effectiveCropsByBed,
    activeBedId,
    addCrops: history.addCrops,
    moveCrops: draft.moveCrops,
    removeCrops: history.removeCrops,
    onAnnounceError: (msg) => showErrorToast(null, msg)
  });

  const palette = useLayoutPalettePlacement({
    beds,
    evaluateStored,
    addCrop: history.addCrop,
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
    addCrops: history.addCrops
  });

  const cropDrag = useLayoutSingleCropDrag({
    bedsById,
    cropsByBed: effectiveCropsByBed,
    evaluateStored,
    moveCrop: history.moveCrop,
    setPreview: palette.setPreview,
    onSelectSingleCrop: marquee.selectSingleCrop,
    onAnnounceError: (msg) => showErrorToast(null, msg)
  });

  const { preview: palettePreview } = palette;
  const { draggingCropId } = cropDrag;
  const { groupMovePreview } = marquee;

  const { activePlant } = palette;
  const {
    isDrawing: isBrushDrawing,
    strokeBedId: brushStrokeBedId,
    candidates: brushCandidates
  } = brush;
  const brushPreviewCrops = useMemo(() => {
    if (!isBrushDrawing || !brushStrokeBedId || !activePlant) return null;
    const validCandidates = brushCandidates.filter(
      (candidate) => candidate.isValid
    );
    if (validCandidates.length === 0) return null;

    const { identity } = activePlant;
    const familyId =
      typeof identity.family === 'string'
        ? identity.family
        : identity.family.id;
    const crops: CropPlacementItem[] = validCandidates.map(
      (candidate, index) => ({
        id: `brush-preview-${brushStrokeBedId}-${index}`,
        bedId: brushStrokeBedId,
        plantId: activePlant.id,
        commonName: identity.name.primary,
        scientificName: identity.scientificName,
        familyId,
        genus: identity.genus,
        position: candidate.position,
        vitalRadius: candidate.vitalRadius,
        growthStatus: 'planted',
        version: 0,
        isNew: true
      })
    );
    return { bedId: brushStrokeBedId, crops };
  }, [isBrushDrawing, brushStrokeBedId, brushCandidates, activePlant]);

  const associationCropsByBed = useMemo(
    () =>
      buildAssociationCropsByBed({
        effectiveCropsByBed,
        draggingCropId,
        singlePreview: palettePreview,
        groupMovePreview,
        brushPreviewCrops
      }),
    [
      effectiveCropsByBed,
      draggingCropId,
      palettePreview,
      groupMovePreview,
      brushPreviewCrops
    ]
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

  const { save: draftSave, discardChanges: draftDiscardChanges } = draft;
  const { clear: clearHistory, reset: resetHistory } = history;
  const save = useCallback(async () => {
    const status = await draftSave();
    if (status === 'conflict') {
      showErrorToast(null, t('bed.placement.save_conflict'));
    } else if (status === 'error') {
      showErrorToast(null, t('bed.placement.save_error'));
    } else if (status === 'ok') {
      clearHistory();
      showSuccessToast(t('bed.placement.save_success'));
    }
  }, [draftSave, clearHistory, showErrorToast, showSuccessToast]);

  const discardChanges = useCallback(() => {
    draftDiscardChanges();
    resetHistory();
  }, [draftDiscardChanges, resetHistory]);

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
    discardChanges,
    canUndo: history.canUndo,
    undo: history.undo,
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
      marquee.deleteSelectedCrops();
    },
    reset
  };
}
