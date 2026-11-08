import {
  batchPlacePlantInstances,
  batchRemovePlantInstances,
  batchUpdatePlantInstances
} from '../../../services/plantInstances.service';
import {
  evaluatePerimeter,
  evaluatePlacementCollision,
  type SpatialCrop
} from '../../../components/beds/visualizer/utils/spatialCollisions';
import type { Coordinates } from '../../../types/PlantInstance/PlantInstance';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';

export function toSpatialCrop(crop: CropPlacementItem): SpatialCrop {
  return {
    id: crop.id,
    x: crop.position.x,
    y: crop.position.y,
    vitalRadius: crop.vitalRadius
  };
}

export function computePerimeterWarnings(
  crops: readonly CropPlacementItem[],
  width: number,
  height: number
): ReadonlySet<string> {
  const warnings = new Set<string>();
  for (const crop of crops) {
    const evaluation = evaluatePerimeter(toSpatialCrop(crop), {
      width,
      height
    });
    if (evaluation.isCenterInside && evaluation.isOverflowing) {
      warnings.add(crop.id);
    }
  }
  return warnings;
}

export function creationPayload(crop: CropPlacementItem, bedId: string) {
  return {
    id: crop.id,
    bedId,
    plantId: crop.plantId,
    position: crop.position,
    growthStatus: crop.growthStatus,
    plantedAt: new Date().toISOString()
  };
}

export function evaluateDraftPlacement(
  position: Coordinates,
  vitalRadius: number,
  currentCrops: readonly CropPlacementItem[],
  bed: { readonly width: number; readonly height: number },
  ignoreCropId?: string
) {
  const perimeter = evaluatePerimeter(
    { id: '__candidate__', x: position.x, y: position.y, vitalRadius },
    { width: bed.width, height: bed.height }
  );
  const hasCollision = evaluatePlacementCollision(
    position,
    vitalRadius,
    currentCrops.map(toSpatialCrop),
    ignoreCropId
  );
  return { isOutOfBounds: !perimeter.isCenterInside, hasCollision };
}

export interface PersistBatchParams {
  readonly bedId: string;
  readonly pendingCreations: readonly CropPlacementItem[];
  readonly pendingUpdates: readonly CropPlacementItem[];
  readonly pendingDeletions: readonly CropPlacementItem[];
}

export async function executePersistBatch(
  params: PersistBatchParams
): Promise<void> {
  if (params.pendingCreations.length > 0) {
    await batchPlacePlantInstances({
      bedId: params.bedId,
      items: params.pendingCreations.map((crop) => ({
        id: crop.id,
        plantId: crop.plantId,
        position: crop.position,
        growthStatus: crop.growthStatus
      }))
    });
  }

  if (params.pendingUpdates.length > 0) {
    await batchUpdatePlantInstances({
      items: params.pendingUpdates.map((crop) => ({
        id: crop.id,
        version: crop.version,
        position: crop.position,
        growthStatus: crop.growthStatus
      }))
    });
  }

  if (params.pendingDeletions.length > 0) {
    await batchRemovePlantInstances({
      items: params.pendingDeletions.map((crop) => ({
        id: crop.id,
        version: crop.version
      }))
    });
  }
}
