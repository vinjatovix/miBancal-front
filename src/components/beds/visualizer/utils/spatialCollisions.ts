import type {
  PerimeterEvaluation,
  SpatialCollision
} from '../../../../types/PlantInstance/plantPlacementTypes';

export const DEFAULT_VITAL_RADIUS_CM = 15;

export const COLLISION_EPSILON_CM = 1e-6;

export interface SpatialCrop {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly vitalRadius: number;
}

export interface SpatialPoint {
  readonly x: number;
  readonly y: number;
}

export function calculateVitalRadius(spacingCmMin?: number | null): number {
  if (
    spacingCmMin === undefined ||
    spacingCmMin === null ||
    spacingCmMin <= 0
  ) {
    return DEFAULT_VITAL_RADIUS_CM;
  }
  return spacingCmMin / 2;
}

export function calculateDistance(p1: SpatialPoint, p2: SpatialPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function evaluateCollision(
  p1: SpatialPoint & { readonly vitalRadius: number },
  p2: SpatialPoint & { readonly vitalRadius: number }
): boolean {
  return (
    calculateDistance(p1, p2) <
    p1.vitalRadius + p2.vitalRadius - COLLISION_EPSILON_CM
  );
}

export function evaluatePlacementCollision(
  position: SpatialPoint,
  vitalRadius: number,
  crops: readonly SpatialCrop[],
  ignoreCropId?: string
): boolean {
  return crops.some(
    (crop) =>
      crop.id !== ignoreCropId &&
      evaluateCollision({ ...position, vitalRadius }, crop)
  );
}

export function findCollisions(
  crops: readonly SpatialCrop[]
): readonly SpatialCollision[] {
  const collisions: SpatialCollision[] = [];

  for (let i = 0; i < crops.length; i += 1) {
    for (let j = i + 1; j < crops.length; j += 1) {
      const a = crops[i];
      const b = crops[j];
      const distance = calculateDistance(a, b);
      const requiredDistance = a.vitalRadius + b.vitalRadius;
      if (distance < requiredDistance - COLLISION_EPSILON_CM) {
        collisions.push({
          cropIdA: a.id,
          cropIdB: b.id,
          distance,
          requiredDistance
        });
      }
    }
  }

  return collisions;
}

export function evaluatePerimeter(
  crop: SpatialCrop,
  bedDimensions: { readonly width: number; readonly height: number }
): PerimeterEvaluation {
  const isCenterInside =
    crop.x >= 0 &&
    crop.x <= bedDimensions.width &&
    crop.y >= 0 &&
    crop.y <= bedDimensions.height;

  const overflowEdges = {
    left: crop.x - crop.vitalRadius < 0,
    right: crop.x + crop.vitalRadius > bedDimensions.width,
    top: crop.y - crop.vitalRadius < 0,
    bottom: crop.y + crop.vitalRadius > bedDimensions.height
  };

  const isOverflowing =
    overflowEdges.left ||
    overflowEdges.right ||
    overflowEdges.top ||
    overflowEdges.bottom;

  return {
    cropId: crop.id,
    isCenterInside,
    isOverflowing,
    overflowEdges
  };
}
