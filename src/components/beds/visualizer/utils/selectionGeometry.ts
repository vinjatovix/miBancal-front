import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type {
  BatchCropMoveItem,
  GroupBoundingBox,
  MarqueeBox
} from '../../../../types/PlantInstance/brushSelectionTypes';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';
import { calculateDistance, COLLISION_EPSILON_CM } from './spatialCollisions';

export function computeMarqueeBox(
  start: Coordinates,
  current: Coordinates
): MarqueeBox {
  const minX = Math.min(start.x, current.x);
  const minY = Math.min(start.y, current.y);
  const maxX = Math.max(start.x, current.x);
  const maxY = Math.max(start.y, current.y);

  return {
    start,
    current,
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

export function isPointInMarquee(point: Coordinates, box: MarqueeBox): boolean {
  return (
    point.x >= box.minX &&
    point.x <= box.maxX &&
    point.y >= box.minY &&
    point.y <= box.maxY
  );
}

export function findCropsInMarquee(
  crops: readonly CropPlacementItem[],
  box: MarqueeBox
): readonly string[] {
  const matches: string[] = [];
  for (const crop of crops) {
    if (isPointInMarquee(crop.position, box)) {
      matches.push(crop.id);
    }
  }
  return matches;
}

export function computeGroupBoundingBox(
  crops: readonly CropPlacementItem[],
  selectedIds: ReadonlySet<string>,
  paddingCm = 4
): GroupBoundingBox | null {
  if (selectedIds.size === 0) {
    return null;
  }

  const selectedCrops = crops.filter((crop) => selectedIds.has(crop.id));
  if (selectedCrops.length === 0) {
    return null;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const crop of selectedCrops) {
    const left = crop.position.x - crop.vitalRadius;
    const right = crop.position.x + crop.vitalRadius;
    const top = crop.position.y - crop.vitalRadius;
    const bottom = crop.position.y + crop.vitalRadius;

    if (left < minX) minX = left;
    if (right > maxX) maxX = right;
    if (top < minY) minY = top;
    if (bottom > maxY) maxY = bottom;
  }

  minX -= paddingCm;
  minY -= paddingCm;
  maxX += paddingCm;
  maxY += paddingCm;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
    center: {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    },
    count: selectedCrops.length
  };
}

export interface EvaluateGroupMovementParams {
  readonly crops: readonly CropPlacementItem[];
  readonly selectedCropIds: ReadonlySet<string>;
  readonly displacementCm: Coordinates;
  readonly bedDimensions: { readonly width: number; readonly height: number };
}

export interface EvaluateGroupMovementResult {
  readonly isValid: boolean;
  readonly hasCollision: boolean;
  readonly isOutOfBounds: boolean;
}

export function evaluateGroupMovement({
  crops,
  selectedCropIds,
  displacementCm,
  bedDimensions
}: EvaluateGroupMovementParams): EvaluateGroupMovementResult {
  if (selectedCropIds.size === 0) {
    return { isValid: true, hasCollision: false, isOutOfBounds: false };
  }

  const fixedCrops = crops.filter((crop) => !selectedCropIds.has(crop.id));
  const selectedCrops = crops.filter((crop) => selectedCropIds.has(crop.id));

  let isOutOfBounds = false;
  let hasCollision = false;

  for (const crop of selectedCrops) {
    const targetX = crop.position.x + displacementCm.x;
    const targetY = crop.position.y + displacementCm.y;

    if (
      targetX < 0 ||
      targetX > bedDimensions.width ||
      targetY < 0 ||
      targetY > bedDimensions.height
    ) {
      isOutOfBounds = true;
      break;
    }

    const collidesWithFixed = fixedCrops.some((fixed) => {
      const distance = calculateDistance(
        { x: targetX, y: targetY },
        fixed.position
      );
      return (
        distance < crop.vitalRadius + fixed.vitalRadius - COLLISION_EPSILON_CM
      );
    });

    if (collidesWithFixed) {
      hasCollision = true;
      break;
    }
  }

  const isValid = !isOutOfBounds && !hasCollision;

  return {
    isValid,
    hasCollision,
    isOutOfBounds
  };
}

export function buildGroupMoves(
  selectedCropIds: ReadonlySet<string>,
  crops: readonly CropPlacementItem[],
  displacement: Coordinates
): readonly BatchCropMoveItem[] {
  const moves: BatchCropMoveItem[] = [];
  for (const id of selectedCropIds) {
    const crop = crops.find((c) => c.id === id);
    if (crop) {
      moves.push({
        id,
        version: crop.version,
        position: {
          x: crop.position.x + displacement.x,
          y: crop.position.y + displacement.y
        }
      });
    }
  }
  return moves;
}
