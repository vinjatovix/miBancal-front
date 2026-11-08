import { useCallback, useRef } from 'react';

import { t } from '../../../../i18n/core/t';
import type { Point } from '../../../../components/beds/layout/utils/layoutGeometry';
import type { ResolvedBed } from '../../../../components/beds/layout/utils/layoutTypes';
import {
  globalToBedLocal,
  isLocalPointInsideBed
} from '../../../../components/beds/layout/utils/plantPlacementGeometry';
import {
  getPlantInstance,
  updatePlantInstance
} from '../../../../services/plantInstances.service';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import type { LayoutPlacementPreview } from './useLayoutPalettePlacement';

export interface UseLayoutSingleCropDragParams {
  readonly bedsById: ReadonlyMap<string, ResolvedBed>;
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly evaluateStored: (
    bed: ResolvedBed,
    stored: Coordinates,
    vitalRadius: number,
    ignoreCropId?: string
  ) => { readonly hasCollision: boolean; readonly isOutOfBounds: boolean };
  readonly invalidateBed: (bedId: string) => Promise<void>;
  readonly setPreview: (preview: LayoutPlacementPreview | null) => void;
  readonly onSelectSingleCrop: (cropId: string) => void;
  readonly setIsSaving: (saving: boolean) => void;
  readonly onAnnounceError: (message: string) => void;
}

export function useLayoutSingleCropDrag({
  bedsById,
  cropsByBed,
  evaluateStored,
  invalidateBed,
  setPreview,
  onSelectSingleCrop,
  setIsSaving,
  onAnnounceError
}: UseLayoutSingleCropDragParams) {
  const cropDragRef = useRef<{
    readonly cropId: string;
    readonly bedId: string;
  } | null>(null);

  const beginCropDrag = useCallback(
    (cropId: string, bedId: string) => {
      cropDragRef.current = { cropId, bedId };
      onSelectSingleCrop(cropId);
    },
    [onSelectSingleCrop]
  );

  const moveCropDrag = useCallback(
    (global: Point) => {
      const drag = cropDragRef.current;
      if (!drag) return;
      const bed = bedsById.get(drag.bedId);
      if (!bed) return;
      const crops = cropsByBed.get(bed.id) ?? [];
      const crop = crops.find((item) => item.id === drag.cropId);
      if (!crop) return;
      const local = globalToBedLocal(bed, global);
      const evaluation = evaluateStored(bed, local, crop.vitalRadius, crop.id);
      setPreview({
        bedId: bed.id,
        local,
        vitalRadius: crop.vitalRadius,
        commonName: crop.commonName,
        hasCollision: evaluation.hasCollision,
        isOutOfBounds: evaluation.isOutOfBounds
      });
    },
    [bedsById, cropsByBed, evaluateStored, setPreview]
  );

  const endCropDrag = useCallback(
    async (global: Point | null) => {
      const drag = cropDragRef.current;
      cropDragRef.current = null;
      setPreview(null);
      if (!drag || !global) return;
      const bed = bedsById.get(drag.bedId);
      if (!bed) return;
      const crops = cropsByBed.get(bed.id) ?? [];
      const crop = crops.find((item) => item.id === drag.cropId);
      if (!crop) return;
      const local = globalToBedLocal(bed, global);
      if (!isLocalPointInsideBed(bed, local)) return;
      if (local.x === crop.position.x && local.y === crop.position.y) return;
      const evaluation = evaluateStored(bed, local, crop.vitalRadius, crop.id);
      if (evaluation.isOutOfBounds) {
        onAnnounceError(t('bed.placement.announce_out_of_bounds'));
        return;
      }
      if (evaluation.hasCollision) {
        onAnnounceError(t('bed.placement.announce_collision'));
        return;
      }
      setIsSaving(true);
      try {
        const { etag } = await getPlantInstance(crop.id);
        await updatePlantInstance(
          crop.id,
          { position: local },
          etag ?? crop.etag ?? ''
        );
        await invalidateBed(bed.id);
      } catch {
        onAnnounceError(t('bed.placement.save_error'));
      } finally {
        setIsSaving(false);
      }
    },
    [
      bedsById,
      cropsByBed,
      evaluateStored,
      invalidateBed,
      setPreview,
      setIsSaving,
      onAnnounceError
    ]
  );

  const resetCropDrag = useCallback(() => {
    cropDragRef.current = null;
  }, []);

  return {
    beginCropDrag,
    moveCropDrag,
    endCropDrag,
    resetCropDrag
  };
}
