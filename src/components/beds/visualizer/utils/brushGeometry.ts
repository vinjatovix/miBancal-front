import type { Coordinates } from '../../../../types/PlantInstance/PlantInstance';
import type {
  BrushCandidatePosition,
  BrushDirectrix
} from '../../../../types/PlantInstance/brushSelectionTypes';
import {
  evaluateCollision,
  evaluatePerimeter,
  type SpatialCrop
} from './spatialCollisions';

export const DEFAULT_BRUSH_SPACING_CM = 30;

export const BRUSH_SPACING_SAFETY_CM = 1;

export function resolveBrushSpacing(spacingCmMin?: number): number {
  if (spacingCmMin === undefined || spacingCmMin <= 0) {
    return DEFAULT_BRUSH_SPACING_CM;
  }
  return spacingCmMin;
}

export function resolveBrushStepSpacing(spacingCmMin?: number): number {
  return resolveBrushSpacing(spacingCmMin) + BRUSH_SPACING_SAFETY_CM;
}

export function calculateDirectrix(
  start: Coordinates,
  end: Coordinates
): BrushDirectrix {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthCm = Math.hypot(dx, dy);

  if (lengthCm === 0) {
    return {
      start,
      end,
      lengthCm: 0,
      unitVector: { x: 1, y: 0 },
      normalVector: { x: 0, y: 1 }
    };
  }

  const unitVector = { x: dx / lengthCm, y: dy / lengthCm };
  const normalVector = { x: -unitVector.y, y: unitVector.x };

  return {
    start,
    end,
    lengthCm,
    unitVector,
    normalVector
  };
}

export function generateSingleRowPositions(
  directrix: BrushDirectrix,
  spacingCmMin?: number
): readonly Coordinates[] {
  const spacing = resolveBrushSpacing(spacingCmMin);
  const { start, lengthCm, unitVector } = directrix;

  if (lengthCm < spacing) {
    return [{ x: start.x, y: start.y }];
  }

  const count = Math.floor(lengthCm / spacing) + 1;
  const positions: Coordinates[] = [];

  for (let i = 0; i < count; i += 1) {
    positions.push({
      x: start.x + i * spacing * unitVector.x,
      y: start.y + i * spacing * unitVector.y
    });
  }

  return positions;
}

export function generateDoubleRowPositions(
  directrix: BrushDirectrix,
  spacingCmMin?: number
): readonly Coordinates[] {
  const spacing = resolveBrushSpacing(spacingCmMin);
  const { start, lengthCm, unitVector, normalVector } = directrix;
  const halfSpacing = spacing / 2;

  if (lengthCm < spacing) {
    return [
      {
        x: start.x + halfSpacing * normalVector.x,
        y: start.y + halfSpacing * normalVector.y
      },
      {
        x: start.x - halfSpacing * normalVector.x,
        y: start.y - halfSpacing * normalVector.y
      }
    ];
  }

  const count = Math.floor(lengthCm / spacing) + 1;
  const rowLeft: Coordinates[] = [];
  const rowRight: Coordinates[] = [];

  for (let i = 0; i < count; i += 1) {
    const baseX = start.x + i * spacing * unitVector.x;
    const baseY = start.y + i * spacing * unitVector.y;

    rowLeft.push({
      x: baseX + halfSpacing * normalVector.x,
      y: baseY + halfSpacing * normalVector.y
    });
    rowRight.push({
      x: baseX - halfSpacing * normalVector.x,
      y: baseY - halfSpacing * normalVector.y
    });
  }

  return [...rowLeft, ...rowRight];
}

export function generateStaggeredTrianglePositions(
  directrix: BrushDirectrix,
  spacingCmMin?: number
): readonly Coordinates[] {
  const spacing = resolveBrushSpacing(spacingCmMin);
  const { start, lengthCm, unitVector, normalVector } = directrix;
  const h = spacing * (Math.sqrt(3) / 2);
  const halfH = h / 2;
  const halfSpacing = spacing / 2;

  if (lengthCm < halfSpacing) {
    return [
      {
        x: start.x + halfH * normalVector.x,
        y: start.y + halfH * normalVector.y
      }
    ];
  }

  const rowUpper: Coordinates[] = [];
  const rowLower: Coordinates[] = [];

  let i = 0;
  while (i * spacing <= lengthCm) {
    const dist = i * spacing;
    rowUpper.push({
      x: start.x + dist * unitVector.x + halfH * normalVector.x,
      y: start.y + dist * unitVector.y + halfH * normalVector.y
    });
    i += 1;
  }

  let j = 0;
  while (j * spacing + halfSpacing <= lengthCm) {
    const dist = j * spacing + halfSpacing;
    rowLower.push({
      x: start.x + dist * unitVector.x - halfH * normalVector.x,
      y: start.y + dist * unitVector.y - halfH * normalVector.y
    });
    j += 1;
  }

  return [...rowUpper, ...rowLower];
}

export interface PermissiveBrushEvaluationParams {
  readonly rawPositions: readonly Coordinates[];
  readonly vitalRadius: number;
  readonly existingCrops: readonly SpatialCrop[];
  readonly bedDimensions: { readonly width: number; readonly height: number };
}

export interface PermissiveBrushEvaluationResult {
  readonly accepted: readonly Coordinates[];
  readonly candidates: readonly BrushCandidatePosition[];
  readonly plantedCount: number;
  readonly omittedCount: number;
}

export function evaluatePermissiveBrushPlacement(
  params: PermissiveBrushEvaluationParams
): PermissiveBrushEvaluationResult {
  const { rawPositions, vitalRadius, existingCrops, bedDimensions } = params;
  const accepted: Coordinates[] = [];
  const acceptedSpatial: SpatialCrop[] = [];
  const candidates: BrushCandidatePosition[] = [];

  for (let idx = 0; idx < rawPositions.length; idx += 1) {
    const position = rawPositions[idx];
    const candidatePoint = {
      id: `__cand_${idx}__`,
      x: position.x,
      y: position.y,
      vitalRadius
    };

    const perimeter = evaluatePerimeter(candidatePoint, bedDimensions);
    if (!perimeter.isCenterInside) {
      candidates.push({
        position,
        vitalRadius,
        isValid: false,
        omissionReason: 'out_of_bounds',
        rowIndex: 0,
        itemIndex: idx
      });
      continue;
    }

    const collidesWithFixed = existingCrops.some((crop) =>
      evaluateCollision(candidatePoint, crop)
    );
    if (collidesWithFixed) {
      candidates.push({
        position,
        vitalRadius,
        isValid: false,
        omissionReason: 'collision',
        rowIndex: 0,
        itemIndex: idx
      });
      continue;
    }

    const collidesWithAccepted = acceptedSpatial.some((crop) =>
      evaluateCollision(candidatePoint, crop)
    );
    if (collidesWithAccepted) {
      candidates.push({
        position,
        vitalRadius,
        isValid: false,
        omissionReason: 'collision',
        rowIndex: 0,
        itemIndex: idx
      });
      continue;
    }

    accepted.push(position);
    acceptedSpatial.push(candidatePoint);
    candidates.push({
      position,
      vitalRadius,
      isValid: true,
      rowIndex: 0,
      itemIndex: idx
    });
  }

  return {
    accepted,
    candidates,
    plantedCount: accepted.length,
    omittedCount: rawPositions.length - accepted.length
  };
}
