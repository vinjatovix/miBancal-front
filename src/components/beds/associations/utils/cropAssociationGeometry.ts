import type {
  PlantRelation,
  PlantRelationMechanism
} from '../../../../types/Plants/PlantRelation';
import type {
  ActiveAssociationLink,
  AssociationFilterMode,
  AssociationScope,
  ComputeAssociationsParams
} from '../types/cropAssociationTypes';
import {
  getRelationsForPair,
  resolveVisualPolarity
} from './botanicalRelationIndex';

const DEFAULT_EFFECTIVE_REACH_CM = 100;

const SOIL_MEDIATED_MECHANISMS: ReadonlySet<PlantRelationMechanism> = new Set([
  'nitrogen_fixer',
  'nutrient_accumulator'
]);

export function filterRelationsForScope(
  relations: readonly PlantRelation[],
  scope: AssociationScope
): readonly PlantRelation[] {
  if (scope === 'intra_bed') {
    return relations;
  }
  return relations.filter(
    (relation) => !SOIL_MEDIATED_MECHANISMS.has(relation.mechanism)
  );
}

export function calculateEuclideanDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.hypot(dx, dy);
  return Math.round(distance * 10) / 10;
}

export function calculateMidpoint(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: Math.round(((p1.x + p2.x) / 2) * 10) / 10,
    y: Math.round(((p1.y + p2.y) / 2) * 10) / 10
  };
}

export function calculateEffectiveReach(
  relations: readonly PlantRelation[],
  defaultReachCm = DEFAULT_EFFECTIVE_REACH_CM
): number {
  if (relations.length === 0) {
    return defaultReachCm;
  }

  const reaches = relations.map((relation) =>
    relation.proximity?.maxDistanceCm != null
      ? relation.proximity.maxDistanceCm
      : defaultReachCm
  );

  return Math.min(...reaches);
}

export function transformLocalToGlobal(
  x: number,
  y: number,
  bedX: number,
  bedY: number,
  rotationDegrees = 0
): { x: number; y: number } {
  const radians = (rotationDegrees * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  const globalX = bedX + x * cos - y * sin;
  const globalY = bedY + x * sin + y * cos;

  return {
    x: Math.round(globalX * 10) / 10,
    y: Math.round(globalY * 10) / 10
  };
}

function buildCanonicalLinkId(cropAId: string, cropBId: string): string {
  return cropAId <= cropBId ? `${cropAId}:${cropBId}` : `${cropBId}:${cropAId}`;
}

export function computeActiveAssociationLinks(
  params: ComputeAssociationsParams
): readonly ActiveAssociationLink[] {
  const { crops, relationIndex, options } = params;
  const defaultReachCm =
    options?.defaultMaxDistanceCm ?? DEFAULT_EFFECTIVE_REACH_CM;

  const links: ActiveAssociationLink[] = [];

  for (let i = 0; i < crops.length; i += 1) {
    const cropA = crops[i];

    for (let j = i + 1; j < crops.length; j += 1) {
      const cropB = crops[j];

      if (cropA.id === cropB.id) {
        continue;
      }

      const pairRelations = getRelationsForPair(
        relationIndex,
        cropA.plantId,
        cropB.plantId
      );

      if (pairRelations.length === 0) {
        continue;
      }

      const scope: AssociationScope =
        cropA.bedId === cropB.bedId ? 'intra_bed' : 'cross_bed';
      const relations = filterRelationsForScope(pairRelations, scope);

      if (relations.length === 0) {
        continue;
      }

      const distanceCm = calculateEuclideanDistance(cropA, cropB);
      const effectiveReachCm = calculateEffectiveReach(
        relations,
        defaultReachCm
      );

      if (distanceCm > effectiveReachCm) {
        continue;
      }

      const { visualPolarity, isWarningPriority } =
        resolveVisualPolarity(relations);

      links.push({
        id: buildCanonicalLinkId(cropA.id, cropB.id),
        cropA,
        cropB,
        distanceCm,
        effectiveReachCm,
        scope,
        relations,
        visualPolarity,
        isWarningPriority,
        midpoint: calculateMidpoint(cropA, cropB)
      });
    }
  }

  return links;
}

export function filterAssociationLinks(
  links: readonly ActiveAssociationLink[],
  filterMode: AssociationFilterMode = 'all'
): readonly ActiveAssociationLink[] {
  if (filterMode === 'detrimental_only') {
    return links.filter((link) => link.visualPolarity === 'detrimental');
  }

  return links;
}
