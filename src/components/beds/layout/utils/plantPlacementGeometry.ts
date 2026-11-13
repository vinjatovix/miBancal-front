import type { Point } from './layoutGeometry';
import type { ResolvedBed } from './layoutTypes';

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function globalToBedLocal(bed: ResolvedBed, global: Point): Point {
  const radians = degreesToRadians(-bed.rotation);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = global.x - bed.position.x;
  const dy = global.y - bed.position.y;
  return {
    x: dx * cos - dy * sin,
    y: dx * sin + dy * cos
  };
}

export function isLocalPointInsideBed(
  bed: { readonly width: number; readonly height: number },
  local: Point
): boolean {
  return (
    local.x >= 0 &&
    local.x <= bed.width &&
    local.y >= 0 &&
    local.y <= bed.height
  );
}

export function findBedAtPoint(
  beds: readonly ResolvedBed[],
  global: Point
): ResolvedBed | null {
  for (let index = beds.length - 1; index >= 0; index -= 1) {
    const bed = beds[index];
    if (isLocalPointInsideBed(bed, globalToBedLocal(bed, global))) {
      return bed;
    }
  }
  return null;
}
