import { useCallback, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import type { I18nKey } from '../../../i18n/core/types';
import { useAuth } from '../../../shared/auth/useAuth';
import { bedKeys } from '../../../shared/reactQuery/bedKeys';
import { plantInstanceKeys } from '../../../shared/reactQuery/plantInstanceKeys';
import { PreconditionFailedError } from '../../../shared/errors/PreconditionFailedError';
import { findCollisions } from '../../../components/beds/visualizer/utils/spatialCollisions';
import type { Coordinates } from '../../../types/PlantInstance/PlantInstance';
import type {
  CropPlacementItem,
  SpatialCollision
} from '../../../types/PlantInstance/plantPlacementTypes';
import type {
  BatchCropCreationItem,
  BatchCropMoveItem,
  PlantPlacementInput
} from '../../../types/PlantInstance/brushSelectionTypes';
import {
  computePerimeterWarnings,
  evaluateDraftPlacement,
  executePersistBatch,
  toSpatialCrop
} from './bedPlacementDraftUtils';
import {
  addBatchCrops,
  duplicateBatchCrops,
  moveBatchCrops,
  removeBatchCrops
} from './bedPlacementBatchOperations';
import { useCropSelection } from './useCropSelection';

export type { PlantPlacementInput };

export interface BedDraftDimensions {
  readonly id: string;
  readonly width: number;
  readonly height: number;
}

export interface UseBedPlacementDraftParams {
  readonly bed: BedDraftDimensions;
  readonly initialCrops: readonly CropPlacementItem[];
}

export type DraftSaveStatus = 'collision' | 'out_of_bounds' | 'ok';

export function useBedPlacementDraft({
  bed,
  initialCrops
}: UseBedPlacementDraftParams) {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const [baseline, setBaseline] = useState(initialCrops);
  const [currentCrops, setCurrentCrops] = useState(initialCrops);
  const [deletedCrops, setDeletedCrops] = useState<
    readonly CropPlacementItem[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<I18nKey | null>(null);

  const {
    selectedCropId,
    selectedCropIds,
    selectCrop,
    setSelectedCropIds,
    toggleCropSelection,
    clearSelection,
    pruneSelection
  } = useCropSelection();

  const pendingCreations = useMemo(
    () => currentCrops.filter((crop) => crop.isNew),
    [currentCrops]
  );
  const pendingUpdates = useMemo(
    () => currentCrops.filter((crop) => !crop.isNew && crop.hasMoved),
    [currentCrops]
  );
  const pendingDeletions = useMemo(
    () => deletedCrops.filter((crop) => !crop.isNew),
    [deletedCrops]
  );

  const collisions: readonly SpatialCollision[] = useMemo(
    () => findCollisions(currentCrops.map(toSpatialCrop)),
    [currentCrops]
  );
  const perimeterWarnings = useMemo(
    () => computePerimeterWarnings(currentCrops, bed.width, bed.height),
    [currentCrops, bed.width, bed.height]
  );

  const hasChanges =
    pendingCreations.length > 0 ||
    pendingUpdates.length > 0 ||
    pendingDeletions.length > 0;

  if (baseline !== initialCrops && !hasChanges) {
    setBaseline(initialCrops);
    setCurrentCrops(initialCrops);
    setDeletedCrops([]);
  }

  const addCrops = useCallback(
    (items: readonly BatchCropCreationItem[]): readonly string[] => {
      const result = addBatchCrops(currentCrops, bed.id, items);
      if (result.createdIds.length > 0) {
        setCurrentCrops(result.nextCrops);
      }
      return result.createdIds;
    },
    [currentCrops, bed.id]
  );

  const addCrop = useCallback(
    (plant: PlantPlacementInput, position: Coordinates): string => {
      const ids = addCrops([{ plant, position }]);
      return ids[0];
    },
    [addCrops]
  );

  const moveCrops = useCallback((moves: readonly BatchCropMoveItem[]) => {
    setCurrentCrops((prev) => moveBatchCrops(prev, moves));
  }, []);

  const moveCrop = useCallback(
    (id: string, position: Coordinates) => {
      moveCrops([{ id, position }]);
    },
    [moveCrops]
  );

  const removeCrops = useCallback(
    (ids: readonly string[]) => {
      const idSet = new Set(ids);
      setCurrentCrops((prev) => {
        setDeletedCrops((deleted) => {
          const { nextDeletedCrops } = removeBatchCrops(prev, deleted, ids);
          return nextDeletedCrops;
        });
        return prev.filter((crop) => !idSet.has(crop.id));
      });
      pruneSelection(idSet);
    },
    [pruneSelection]
  );

  const removeCrop = useCallback(
    (id: string) => {
      removeCrops([id]);
    },
    [removeCrops]
  );

  const duplicateCrops = useCallback(
    (ids: readonly string[], offsetCm?: Coordinates): readonly string[] => {
      const result = duplicateBatchCrops(currentCrops, bed.id, ids, offsetCm);
      if (result.clonedIds.length > 0) {
        setCurrentCrops(result.nextCrops);
        setSelectedCropIds(new Set(result.clonedIds));
      }
      return result.clonedIds;
    },
    [currentCrops, bed.id, setSelectedCropIds]
  );

  const evaluatePlacement = useCallback(
    (position: Coordinates, vitalRadius: number, ignoreCropId?: string) => {
      return evaluateDraftPlacement(
        position,
        vitalRadius,
        currentCrops,
        bed,
        ignoreCropId
      );
    },
    [currentCrops, bed]
  );

  const discardChanges = useCallback(() => {
    setCurrentCrops(baseline);
    setDeletedCrops([]);
    clearSelection();
    setSaveError(null);
  }, [baseline, clearSelection]);

  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: plantInstanceKeys.byBed(userId, bed.id)
    });
    await queryClient.invalidateQueries({
      queryKey: bedKeys.detail(userId, bed.id)
    });
  }, [queryClient, userId, bed.id]);

  const save = useCallback(async () => {
    if (!hasChanges || isSaving) {
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await executePersistBatch({
        bedId: bed.id,
        pendingCreations,
        pendingUpdates,
        pendingDeletions
      });
      setCurrentCrops((prev) =>
        prev.map((crop) => ({ ...crop, isNew: false, hasMoved: false }))
      );
      setDeletedCrops([]);
      await invalidate();
    } catch (error) {
      await invalidate();
      setSaveError(
        error instanceof PreconditionFailedError
          ? 'bed.placement.save_conflict'
          : 'bed.placement.save_error'
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    hasChanges,
    isSaving,
    bed.id,
    pendingCreations,
    pendingUpdates,
    pendingDeletions,
    invalidate
  ]);

  return {
    bedId: bed.id,
    currentCrops,
    pendingCreations,
    pendingUpdates,
    pendingDeletions,
    collisions,
    perimeterWarnings,
    selectedCropId,
    selectedCropIds,
    hasChanges,
    isSaving,
    saveError,
    addCrop,
    addCrops,
    moveCrop,
    moveCrops,
    removeCrop,
    removeCrops,
    duplicateCrops,
    discardChanges,
    evaluatePlacement,
    selectCrop,
    setSelectedCropIds,
    toggleCropSelection,
    clearSelection,
    save
  };
}
