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

export interface LayoutCreateInput {
  readonly bedId: string;
  readonly plantId: string;
  readonly commonName: string;
  readonly scientificName?: string;
  readonly vitalRadius: number;
  readonly position: Coordinates;
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

const DUPLICATE_MARGIN_CM = 1;

const MAX_DUPLICATE_PLACEMENT_RINGS = 24;

const DUPLICATE_SEARCH_DIRECTIONS: readonly Coordinates[] = [
  { x: 1, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: -1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: -1 }
];

interface SpatialObstacle {
  readonly x: number;
  readonly y: number;
  readonly vitalRadius: number;
}

function isCenterInsideBed(
  position: Coordinates,
  bed: { readonly width: number; readonly height: number }
): boolean {
  return (
    position.x >= 0 &&
    position.x <= bed.width &&
    position.y >= 0 &&
    position.y <= bed.height
  );
}

function collidesWithObstacles(
  position: Coordinates,
  vitalRadius: number,
  obstacles: readonly SpatialObstacle[]
): boolean {
  return obstacles.some((obstacle) =>
    evaluateCollision({ x: position.x, y: position.y, vitalRadius }, obstacle)
  );
}

function findFreeDuplicatePosition(
  origin: Coordinates,
  vitalRadius: number,
  bed: { readonly width: number; readonly height: number },
  obstacles: readonly SpatialObstacle[]
): Coordinates | null {
  const step = 2 * vitalRadius + DUPLICATE_MARGIN_CM;
  for (let ring = 1; ring <= MAX_DUPLICATE_PLACEMENT_RINGS; ring += 1) {
    for (const direction of DUPLICATE_SEARCH_DIRECTIONS) {
      const candidate = {
        x: origin.x + direction.x * step * ring,
        y: origin.y + direction.y * step * ring
      };
      if (!isCenterInsideBed(candidate, bed)) {
        continue;
      }
      if (collidesWithObstacles(candidate, vitalRadius, obstacles)) {
        continue;
      }
      return candidate;
    }
  }
  return null;
}

export function computeDuplicatePlacements(
  cropsToDuplicate: readonly CropPlacementItem[],
  bed: { readonly width: number; readonly height: number },
  existingCrops: readonly CropPlacementItem[] = []
): readonly LayoutCreateInput[] {
  const obstaclesByBed = new Map<string, SpatialObstacle[]>();
  const seedObstacle = (bedId: string, obstacle: SpatialObstacle): void => {
    const list = obstaclesByBed.get(bedId) ?? [];
    list.push(obstacle);
    obstaclesByBed.set(bedId, list);
  };

  for (const crop of [...existingCrops, ...cropsToDuplicate]) {
    seedObstacle(crop.bedId, {
      x: crop.position.x,
      y: crop.position.y,
      vitalRadius: crop.vitalRadius
    });
  }

  const placements: LayoutCreateInput[] = [];

  for (const crop of cropsToDuplicate) {
    const obstacles = obstaclesByBed.get(crop.bedId) ?? [];
    const position = findFreeDuplicatePosition(
      crop.position,
      crop.vitalRadius,
      bed,
      obstacles
    );
    if (!position) {
      continue;
    }
    obstacles.push({
      x: position.x,
      y: position.y,
      vitalRadius: crop.vitalRadius
    });
    placements.push({
      bedId: crop.bedId,
      plantId: crop.plantId,
      commonName: crop.commonName,
      scientificName: crop.scientificName,
      vitalRadius: crop.vitalRadius,
      position
    });
  }

  return placements;
}
