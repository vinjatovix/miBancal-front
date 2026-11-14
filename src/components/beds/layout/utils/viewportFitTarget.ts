import {
  rectAabb,
  unionAabb,
  type BoundingBox,
  type RotatedRectInput
} from './layoutGeometry';

export function resolveFitBounds(
  selected: RotatedRectInput | null,
  placedBeds: readonly RotatedRectInput[]
): BoundingBox | null {
  if (selected !== null) return rectAabb(selected);
  if (placedBeds.length > 0) {
    return unionAabb(placedBeds.map((bed) => rectAabb(bed)));
  }
  return null;
}
