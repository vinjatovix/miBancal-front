import { calculateVitalRadius } from '../../../components/beds/visualizer/utils/spatialCollisions';
import type { Coordinates } from '../../../types/PlantInstance/PlantInstance';
import type {
  BatchCropCreationItem,
  BatchCropMoveItem
} from '../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';

export function addBatchCrops(
  currentCrops: readonly CropPlacementItem[],
  bedId: string,
  items: readonly BatchCropCreationItem[]
): {
  readonly nextCrops: readonly CropPlacementItem[];
  readonly createdIds: readonly string[];
} {
  const createdIds: string[] = [];
  const newCrops: CropPlacementItem[] = [];

  for (const item of items) {
    const id = crypto.randomUUID();
    createdIds.push(id);
    newCrops.push({
      id,
      bedId,
      plantId: item.plant.plantId,
      commonName: item.plant.commonName,
      scientificName: item.plant.scientificName,
      position: item.position,
      vitalRadius: calculateVitalRadius(item.plant.spacingCmMin),
      growthStatus: 'planted',
      version: 0,
      isNew: true
    });
  }

  return {
    nextCrops: [...currentCrops, ...newCrops],
    createdIds
  };
}

export function moveBatchCrops(
  currentCrops: readonly CropPlacementItem[],
  moves: readonly BatchCropMoveItem[]
): readonly CropPlacementItem[] {
  if (moves.length === 0) {
    return currentCrops;
  }

  const moveMap = new Map<string, Coordinates>(
    moves.map((move) => [move.id, move.position])
  );

  return currentCrops.map((crop) => {
    const nextPosition = moveMap.get(crop.id);
    if (!nextPosition) {
      return crop;
    }
    return {
      ...crop,
      position: nextPosition,
      hasMoved: true
    };
  });
}

export function removeBatchCrops(
  currentCrops: readonly CropPlacementItem[],
  deletedCrops: readonly CropPlacementItem[],
  idsToRemove: readonly string[]
): {
  readonly nextCrops: readonly CropPlacementItem[];
  readonly nextDeletedCrops: readonly CropPlacementItem[];
} {
  if (idsToRemove.length === 0) {
    return {
      nextCrops: currentCrops,
      nextDeletedCrops: deletedCrops
    };
  }

  const removeSet = new Set(idsToRemove);
  const newlyDeleted: CropPlacementItem[] = [];
  const nextCrops: CropPlacementItem[] = [];

  for (const crop of currentCrops) {
    if (removeSet.has(crop.id)) {
      if (!crop.isNew) {
        newlyDeleted.push(crop);
      }
    } else {
      nextCrops.push(crop);
    }
  }

  return {
    nextCrops,
    nextDeletedCrops: [...deletedCrops, ...newlyDeleted]
  };
}

export function duplicateBatchCrops(
  currentCrops: readonly CropPlacementItem[],
  bedId: string,
  idsToDuplicate: readonly string[],
  offsetCm: Coordinates = { x: 20, y: 20 }
): {
  readonly nextCrops: readonly CropPlacementItem[];
  readonly clonedIds: readonly string[];
} {
  if (idsToDuplicate.length === 0) {
    return {
      nextCrops: currentCrops,
      clonedIds: []
    };
  }

  const duplicateSet = new Set(idsToDuplicate);
  const clonedIds: string[] = [];
  const clones: CropPlacementItem[] = [];

  for (const crop of currentCrops) {
    if (duplicateSet.has(crop.id)) {
      const id = crypto.randomUUID();
      clonedIds.push(id);
      clones.push({
        ...crop,
        id,
        bedId,
        position: {
          x: crop.position.x + offsetCm.x,
          y: crop.position.y + offsetCm.y
        },
        version: 0,
        etag: undefined,
        isNew: true,
        hasMoved: false
      });
    }
  }

  return {
    nextCrops: [...currentCrops, ...clones],
    clonedIds
  };
}
