import type { BedPosition } from '../../../../types/Location/LocationLayout';
import {
  rectAabb,
  type BoundingBox,
  type RotatedRectInput
} from './layoutGeometry';

export const SNAP_THRESHOLD_CM = 20;
export const GRID_SPACING_CM = 30;

export interface SnapOptions {
  readonly enabled: boolean;
  readonly threshold?: number;
  readonly gridSpacing?: number;
}

export interface SnapResult {
  readonly position: BedPosition;
  readonly rotation: number;
}

interface SnapShift {
  readonly dx: number;
  readonly dy: number;
  readonly gap: number;
}

function rangesOverlap(
  minA: number,
  maxA: number,
  minB: number,
  maxB: number
): boolean {
  return minA <= maxB && minB <= maxA;
}

function axisShift(
  draggedMin: number,
  draggedMax: number,
  neighborMin: number,
  neighborMax: number,
  threshold: number
): number | null {
  const afterGap = draggedMin - neighborMax;
  if (afterGap >= 0 && afterGap <= threshold) return neighborMax - draggedMin;
  const beforeGap = neighborMin - draggedMax;
  if (beforeGap >= 0 && beforeGap <= threshold) return neighborMin - draggedMax;
  return null;
}

function shiftFor(
  dragged: BoundingBox,
  neighbor: BoundingBox,
  threshold: number
): SnapShift | null {
  if (rangesOverlap(dragged.minY, dragged.maxY, neighbor.minY, neighbor.maxY)) {
    const dx = axisShift(
      dragged.minX,
      dragged.maxX,
      neighbor.minX,
      neighbor.maxX,
      threshold
    );
    if (dx !== null) return { dx, dy: 0, gap: Math.abs(dx) };
  }
  if (rangesOverlap(dragged.minX, dragged.maxX, neighbor.minX, neighbor.maxX)) {
    const dy = axisShift(
      dragged.minY,
      dragged.maxY,
      neighbor.minY,
      neighbor.maxY,
      threshold
    );
    if (dy !== null) return { dx: 0, dy, gap: Math.abs(dy) };
  }
  return null;
}

export function applySnap(
  dragged: RotatedRectInput,
  neighbors: readonly RotatedRectInput[],
  options: SnapOptions
): SnapResult {
  const base: SnapResult = {
    position: dragged.position,
    rotation: dragged.rotation
  };

  if (options.enabled) {
    const threshold = options.threshold ?? SNAP_THRESHOLD_CM;
    const draggedBox = rectAabb(dragged);

    let best: { shift: SnapShift; rotation: number } | null = null;
    for (const neighbor of neighbors) {
      const shift = shiftFor(draggedBox, rectAabb(neighbor), threshold);
      if (shift && (!best || shift.gap < best.shift.gap)) {
        best = { shift, rotation: neighbor.rotation };
      }
    }

    if (best) {
      return {
        position: {
          x: dragged.position.x + best.shift.dx,
          y: dragged.position.y + best.shift.dy
        },
        rotation: best.rotation
      };
    }
  }

  if (options.gridSpacing && options.gridSpacing > 0) {
    return {
      position: {
        x: snapToGrid(dragged.position.x, options.gridSpacing),
        y: snapToGrid(dragged.position.y, options.gridSpacing)
      },
      rotation: dragged.rotation
    };
  }

  return base;
}

function snapToGrid(value: number, spacing: number): number {
  return Math.round(value / spacing) * spacing;
}
