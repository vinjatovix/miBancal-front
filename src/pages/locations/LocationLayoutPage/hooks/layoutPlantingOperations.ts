import {
  batchPlacePlantInstances,
  batchRemovePlantInstances,
  batchUpdatePlantInstances
} from '../../../../services/plantInstances.service';
import {
  evaluateCollision,
  evaluatePerimeter
} from '../../../../components/beds/visualizer/utils/spatialCollisions';
import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';

export interface BatchCreateCropItem {
  readonly plantId: string;
  readonly position: Coordinates;
}

export interface BatchCropMoveInput {
  readonly id: string;
  readonly position: Coordinates;
  readonly version?: number;
}

export function evaluateStoredPlacement(
  bed: { readonly width: number; readonly height: number },
  stored: Coordinates,
  vitalRadius: number,
  crops: readonly CropPlacementItem[],
  ignoreCropId?: string
): { readonly hasCollision: boolean; readonly isOutOfBounds: boolean } {
  const perimeter = evaluatePerimeter(
    { id: '__candidate__', x: stored.x, y: stored.y, vitalRadius },
    { width: bed.width, height: bed.height }
  );
  const hasCollision = crops.some(
    (crop) =>
      crop.id !== ignoreCropId &&
      evaluateCollision(
        { x: stored.x, y: stored.y, vitalRadius },
        {
          x: crop.position.x,
          y: crop.position.y,
          vitalRadius: crop.vitalRadius
        }
      )
  );
  return { hasCollision, isOutOfBounds: !perimeter.isCenterInside };
}

export async function batchCreateCrops(
  bedId: string,
  items: readonly BatchCreateCropItem[]
): Promise<void> {
  if (items.length === 0) {
    return;
  }
  await batchPlacePlantInstances({
    bedId,
    items: items.map((item) => ({
      id: crypto.randomUUID(),
      plantId: item.plantId,
      position: item.position,
      growthStatus: 'planted'
    }))
  });
}

export async function batchDeleteCrops(
  crops: readonly CropPlacementItem[]
): Promise<void> {
  if (crops.length === 0) {
    return;
  }
  await batchRemovePlantInstances({
    items: crops.map((crop) => ({
      id: crop.id,
      version: crop.version
    }))
  });
}

export async function batchUpdateCrops(
  moves: readonly BatchCropMoveInput[]
): Promise<void> {
  if (moves.length === 0) {
    return;
  }
  await batchUpdatePlantInstances({
    items: moves.map((move) => ({
      id: move.id,
      version: move.version ?? 0,
      position: move.position
    }))
  });
}

export async function batchDuplicateCrops(
  cropsToDuplicate: readonly CropPlacementItem[],
  bed: { readonly width: number; readonly height: number },
  offset: Coordinates = { x: 20, y: 20 }
): Promise<void> {
  const validItems: {
    readonly bedId: string;
    readonly plantId: string;
    readonly position: Coordinates;
  }[] = [];

  for (const crop of cropsToDuplicate) {
    const newPos = {
      x: crop.position.x + offset.x,
      y: crop.position.y + offset.y
    };
    if (
      newPos.x >= 0 &&
      newPos.x <= bed.width &&
      newPos.y >= 0 &&
      newPos.y <= bed.height
    ) {
      validItems.push({
        bedId: crop.bedId,
        plantId: crop.plantId,
        position: newPos
      });
    }
  }

  if (validItems.length === 0) {
    return;
  }

  const itemsByBed = new Map<
    string,
    { readonly plantId: string; readonly position: Coordinates }[]
  >();

  for (const item of validItems) {
    const list = itemsByBed.get(item.bedId) ?? [];
    list.push({ plantId: item.plantId, position: item.position });
    itemsByBed.set(item.bedId, list);
  }

  for (const [bedId, bedItems] of itemsByBed) {
    await batchPlacePlantInstances({
      bedId,
      items: bedItems.map((item) => ({
        id: crypto.randomUUID(),
        plantId: item.plantId,
        position: item.position,
        growthStatus: 'planted'
      }))
    });
  }
}
