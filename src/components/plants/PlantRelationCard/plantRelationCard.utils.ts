import { t } from '../../../i18n/core/t';
import { tValue } from '../../../i18n/core/tValue';
import type { I18nKey } from '../../../i18n/core/types';
import type { IconName } from '../../../shared/components/Icon/iconPaths';
import {
  DEFAULT_PLANT_SORT,
  type PlantSort,
  type PlantsSortField
} from '../../../services/plantListQuery';
import type {
  CategorizedPlantRelations,
  PlantCompanionInfo,
  PlantRelation,
  PlantRelationType,
  ProximityDistance,
  RelationDirection,
  RelationRole,
  RelationTargetScopeType
} from '../../../types/Plants/PlantRelation';

const EFFECT_TARGET_KEYS = {
  beneficial: {
    plant: 'plant.relations.direction.benefitsTo',
    genus: 'plant.relations.direction.benefitsToGenus',
    family: 'plant.relations.direction.benefitsToFamily',
    all: 'plant.relations.direction.benefitsToAll'
  },
  detrimental: {
    plant: 'plant.relations.direction.harmsTo',
    genus: 'plant.relations.direction.harmsToGenus',
    family: 'plant.relations.direction.harmsToFamily',
    all: 'plant.relations.direction.harmsToAll'
  }
} as const satisfies Record<
  PlantRelationType,
  Record<RelationTargetScopeType, I18nKey>
>;

export function getRelationRole(
  relation: PlantRelation,
  currentPlantId: string
): RelationRole {
  if (relation.role) return relation.role;

  return relation.targetPlantId === currentPlantId ? 'target' : 'source';
}

export function getRelationDirection(
  relation: PlantRelation,
  currentPlantId: string
): RelationDirection {
  return getRelationRole(relation, currentPlantId) === 'target'
    ? 'incoming'
    : 'outgoing';
}

function buildCompanionInfo(
  relation: PlantRelation,
  side: RelationRole
): PlantCompanionInfo {
  const scope = side === 'source' ? relation.source : relation.target;
  const plant = side === 'source' ? relation.sourcePlant : relation.targetPlant;
  const family =
    side === 'source' ? relation.sourceFamily : relation.targetFamily;
  const value = scope.value ?? '';

  switch (scope.scope) {
    case 'plant':
      return plant
        ? {
            id: plant.id,
            slug: plant.slug,
            scope: 'plant',
            primaryName: plant.name.primary,
            scientificName: plant.scientificName,
            imageUrl: plant.image?.url,
            isAvailable: true
          }
        : { id: value, scope: 'plant', isAvailable: false };
    case 'family':
      return family
        ? {
            id: family.id,
            scope: 'family',
            slug: family.slug,
            primaryName: family.name,
            isAvailable: true
          }
        : { id: value, scope: 'family', isAvailable: false };
    case 'genus':
      return {
        id: value,
        scope: 'genus',
        primaryName: value,
        isAvailable: true
      };
    case 'all':
      return {
        id: 'all',
        scope: 'all',
        primaryName: tValue('plantRelation.scopeValues', 'all'),
        isAvailable: true
      };
  }
}

export function extractCompanionInfo(
  relation: PlantRelation,
  currentPlantId: string
): PlantCompanionInfo {
  const role = getRelationRole(relation, currentPlantId);

  return buildCompanionInfo(relation, role === 'target' ? 'source' : 'target');
}

export function getCompanionLink(companion: PlantCompanionInfo): string | null {
  if (!companion.isAvailable) return null;
  if (companion.scope === 'plant') {
    return `/plants/${
      companion.slug && companion.slug.length > 0
        ? companion.slug
        : companion.id
    }`;
  }
  if (
    companion.scope === 'family' &&
    companion.slug &&
    companion.slug.length > 0
  ) {
    return `/families/${encodeURIComponent(companion.slug)}`;
  }
  if (companion.scope === 'genus' && companion.id) {
    return `/plants?genus=${encodeURIComponent(companion.id)}`;
  }

  return null;
}

export function getCompanionIcon(companion: PlantCompanionInfo): IconName {
  switch (companion.scope) {
    case 'plant':
      return 'local_florist';
    case 'all':
      return 'public';
    default:
      return 'biotech';
  }
}

export function getCompanionScopeLabel(
  companion: PlantCompanionInfo
): string | undefined {
  if (companion.scope === 'plant' || companion.scope === 'all') {
    return undefined;
  }

  return tValue('plantRelation.scopeValues', companion.scope);
}

export function formatProximity(proximity: ProximityDistance): string {
  if (proximity.maxDistanceCm === null) {
    return t('plant.relations.proximity.bedWide');
  }

  return `${proximity.minDistanceCm} cm - ${proximity.maxDistanceCm} cm`;
}

export function getDirectionBadgeText(
  relation: PlantRelation,
  currentPlantId: string,
  currentPlantName?: string
): string {
  const role = getRelationRole(relation, currentPlantId);
  const companion = extractCompanionInfo(relation, currentPlantId);
  const effectTarget =
    role === 'source'
      ? { scope: companion.scope, name: companion.primaryName }
      : { scope: 'plant' as const, name: currentPlantName };

  if (effectTarget.scope === 'all') {
    return t(EFFECT_TARGET_KEYS[relation.type].all);
  }

  if (effectTarget.name) {
    return t(EFFECT_TARGET_KEYS[relation.type][effectTarget.scope], {
      name: effectTarget.name
    });
  }

  return relation.type === 'beneficial'
    ? t('plant.relations.direction.benefitsGeneral')
    : t('plant.relations.direction.harmsGeneral');
}

export function getAppliesViaText(relation: PlantRelation): string | undefined {
  if (!relation.appliesVia || relation.appliesVia === 'plant') {
    return undefined;
  }

  return tValue('plantRelation.appliesViaValues', relation.appliesVia);
}

export function categorizePlantRelations(
  relations: readonly PlantRelation[],
  currentPlantId: string
): CategorizedPlantRelations {
  const benefitsReceived: PlantRelation[] = [];
  const benefitsGiven: PlantRelation[] = [];
  const incompatibilities: PlantRelation[] = [];

  for (const relation of relations) {
    if (relation.type === 'detrimental') {
      incompatibilities.push(relation);
    } else if (getRelationRole(relation, currentPlantId) === 'target') {
      benefitsReceived.push(relation);
    } else {
      benefitsGiven.push(relation);
    }
  }

  return {
    benefitsReceived: sortRelations(benefitsReceived, currentPlantId),
    benefitsGiven: sortRelations(benefitsGiven, currentPlantId),
    incompatibilities: sortRelations(incompatibilities, currentPlantId)
  };
}

export interface GroupedCompanionRelations {
  readonly companion: PlantCompanionInfo;
  readonly relations: readonly PlantRelation[];
}

export function groupRelationsByCompanion(
  relations: readonly PlantRelation[],
  currentPlantId: string
): readonly GroupedCompanionRelations[] {
  const map = new Map<
    string,
    { companion: PlantCompanionInfo; relations: PlantRelation[] }
  >();

  for (const relation of relations) {
    const companion = extractCompanionInfo(relation, currentPlantId);
    const groupKey = `${companion.scope}:${companion.id}`;
    const existing = map.get(groupKey);
    if (existing) {
      existing.relations.push(relation);
    } else {
      map.set(groupKey, {
        companion,
        relations: [relation]
      });
    }
  }

  return Array.from(map.values());
}

export function sortCompanionGroups(
  groups: readonly GroupedCompanionRelations[],
  sort: PlantSort = DEFAULT_PLANT_SORT
): readonly GroupedCompanionRelations[] {
  const { field, direction } = sort;
  const factor = direction === 'desc' ? -1 : 1;

  return [...groups].sort((a, b) => {
    const aValue = getCompanionSortValue(a.companion, field);
    const bValue = getCompanionSortValue(b.companion, field);

    return factor * aValue.localeCompare(bValue, 'es', { sensitivity: 'base' });
  });
}

function getCompanionSortValue(
  companion: PlantCompanionInfo,
  field: PlantsSortField = 'name'
): string {
  return (
    (field === 'scientificName'
      ? companion.scientificName || companion.primaryName
      : companion.primaryName) ?? ''
  );
}

function sortRelations(
  relations: PlantRelation[],
  currentPlantId: string
): PlantRelation[] {
  return [...relations].sort((a, b) => {
    const aCompanion = extractCompanionInfo(a, currentPlantId);
    const bCompanion = extractCompanionInfo(b, currentPlantId);

    const aValue = getCompanionSortValue(aCompanion);
    const bValue = getCompanionSortValue(bCompanion);

    return aValue.localeCompare(bValue, 'es', { sensitivity: 'base' });
  });
}
