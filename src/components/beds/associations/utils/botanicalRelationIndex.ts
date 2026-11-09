import type {
  PlantRelation,
  RelationSourceScope,
  RelationTargetScope
} from '../../../../types/Plants/PlantRelation';
import type {
  AssociationCropPoint,
  AssociationVisualPolarity,
  BotanicalRelationIndex
} from '../types/cropAssociationTypes';

export function buildBotanicalPairKey(
  plantIdA: string,
  plantIdB: string
): string {
  return plantIdA <= plantIdB
    ? `${plantIdA}:${plantIdB}`
    : `${plantIdB}:${plantIdA}`;
}

export function resolveVisualPolarity(relations: readonly PlantRelation[]): {
  visualPolarity: AssociationVisualPolarity;
  isWarningPriority: boolean;
} {
  const hasDetrimental = relations.some(
    (relation) => relation.type === 'detrimental'
  );
  const hasBeneficial = relations.some(
    (relation) => relation.type === 'beneficial'
  );

  return {
    visualPolarity: hasDetrimental ? 'detrimental' : 'beneficial',
    isWarningPriority: hasDetrimental && hasBeneficial
  };
}

function cropMatchesScope(
  crop: AssociationCropPoint,
  scope: RelationSourceScope | RelationTargetScope
): boolean {
  switch (scope.scope) {
    case 'plant':
      return crop.plantId === scope.value;
    case 'genus':
      return crop.genus === scope.value;
    case 'family':
      return crop.familyId === scope.value;
    case 'all':
      return true;
    default:
      return false;
  }
}

function appendRelationToPair(
  map: Map<string, PlantRelation[]>,
  key: string,
  relation: PlantRelation
): void {
  const existing = map.get(key);
  if (!existing) {
    map.set(key, [relation]);
    return;
  }
  if (!existing.some((item) => item.id === relation.id)) {
    existing.push(relation);
  }
}

function uniqueCropsByPlantId(
  crops: readonly AssociationCropPoint[]
): AssociationCropPoint[] {
  const byPlantId = new Map<string, AssociationCropPoint>();
  for (const crop of crops) {
    if (crop.plantId && !byPlantId.has(crop.plantId)) {
      byPlantId.set(crop.plantId, crop);
    }
  }
  return [...byPlantId.values()];
}

export function buildBotanicalRelationIndex(
  relations: readonly PlantRelation[],
  crops: readonly AssociationCropPoint[],
  isLoading = false
): BotanicalRelationIndex {
  const map = new Map<string, PlantRelation[]>();
  const uniqueCrops = uniqueCropsByPlantId(crops);

  for (const relation of relations) {
    const sourceCrops = uniqueCrops.filter((crop) =>
      cropMatchesScope(crop, relation.source)
    );
    if (sourceCrops.length === 0) {
      continue;
    }
    const targetCrops = uniqueCrops.filter((crop) =>
      cropMatchesScope(crop, relation.target)
    );

    for (const sourceCrop of sourceCrops) {
      for (const targetCrop of targetCrops) {
        if (sourceCrop.plantId === targetCrop.plantId) {
          continue;
        }
        const key = buildBotanicalPairKey(
          sourceCrop.plantId,
          targetCrop.plantId
        );
        appendRelationToPair(map, key, relation);
      }
    }
  }

  return {
    relationsBySpeciesPair: map,
    hasData: relations.length > 0 || !isLoading,
    isLoading
  };
}

export function getRelationsForPair(
  index: BotanicalRelationIndex,
  plantIdA: string,
  plantIdB: string
): readonly PlantRelation[] {
  const key = buildBotanicalPairKey(plantIdA, plantIdB);
  return index.relationsBySpeciesPair.get(key) ?? [];
}
