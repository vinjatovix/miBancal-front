import type { Point } from './layoutGeometry';

export interface TouchSelectionCandidate {
  readonly id: string;
  readonly centroid: Point;
  readonly zOrder: number;
}

function squaredDistance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function isBetterCandidate(
  candidate: TouchSelectionCandidate,
  candidateDistance: number,
  best: TouchSelectionCandidate | null,
  bestDistance: number
): boolean {
  if (best === null) return true;
  if (candidateDistance < bestDistance) return true;
  return candidateDistance === bestDistance && candidate.zOrder > best.zOrder;
}

export function resolveTouchSelection(
  point: Point,
  candidates: readonly TouchSelectionCandidate[]
): string | null {
  let best: TouchSelectionCandidate | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const candidateDistance = squaredDistance(point, candidate.centroid);
    if (isBetterCandidate(candidate, candidateDistance, best, bestDistance)) {
      best = candidate;
      bestDistance = candidateDistance;
    }
  }
  return best === null ? null : best.id;
}

export interface ResolvableCrop {
  readonly id: string;
  readonly position: Point;
}

export function resolveCropAtPoint(
  point: Point,
  crops: readonly ResolvableCrop[]
): string | null {
  const candidates = crops.map((crop, index) => ({
    id: crop.id,
    centroid: crop.position,
    zOrder: index
  }));
  return resolveTouchSelection(point, candidates);
}
