import type { PaginationResult } from '../../../src/types/Pagination';
import type {
  PaginatedPlantRelationsResponse,
  PlantRelation,
  PlantSummary
} from '../../../src/types/Plants/PlantRelation';

export const DEFAULT_SOURCE_PLANT_ID = '11111111-1111-4111-8111-111111111111';
export const DEFAULT_TARGET_PLANT_ID = '22222222-2222-4222-8222-222222222222';
export const DEFAULT_RELATION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

export function buildPlantSummary(
  overrides: Partial<PlantSummary> = {}
): PlantSummary {
  return {
    id: DEFAULT_SOURCE_PLANT_ID,
    slug: 'albahaca',
    name: {
      primary: 'Albahaca',
      aliases: ['Alhábega']
    },
    scientificName: 'Ocimum basilicum',
    image: {
      url: 'https://images.example.com/basil.jpg',
      title: 'Albahaca fresca',
      source: 'Wikimedia Commons'
    },
    ...overrides
  };
}

export function buildTargetPlantSummary(
  overrides: Partial<PlantSummary> = {}
): PlantSummary {
  return {
    id: DEFAULT_TARGET_PLANT_ID,
    slug: 'tomate',
    name: {
      primary: 'Tomate',
      aliases: ['Tomatera']
    },
    scientificName: 'Solanum lycopersicum',
    image: {
      url: 'https://images.example.com/tomato.jpg',
      title: 'Tomate maduro',
      source: 'Wikimedia Commons'
    },
    ...overrides
  };
}

export function buildPlantRelation(
  overrides: Partial<PlantRelation> = {}
): PlantRelation {
  const sourcePlantId = overrides.sourcePlantId ?? DEFAULT_SOURCE_PLANT_ID;
  const targetPlantId = overrides.targetPlantId ?? DEFAULT_TARGET_PLANT_ID;

  return {
    id: DEFAULT_RELATION_ID,
    source: { scope: 'plant', value: sourcePlantId },
    target: { scope: 'plant', value: targetPlantId },
    sourcePlantId,
    targetPlantId,
    type: 'beneficial',
    mechanism: 'pest_repellent',
    strength: 4,
    proximity: {
      minDistanceCm: 0,
      maxDistanceCm: 50
    },
    reason:
      'El aroma de la albahaca enmascara los compuestos volátiles del tomate, repeliendo el gusano del cuerno y los trips.',
    metadata: {
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      createdBy: 'user-system',
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedBy: 'user-system'
    },
    version: 1,
    sourcePlant: buildPlantSummary({ id: sourcePlantId }),
    targetPlant: buildTargetPlantSummary({ id: targetPlantId }),
    ...overrides
  };
}

export function buildPaginatedPlantRelationsResponse(
  data?: PlantRelation[],
  paginationOverrides: Partial<PaginationResult> = {}
): PaginatedPlantRelationsResponse {
  const items = data ?? [buildPlantRelation()];

  return {
    data: items,
    pagination: {
      page: 1,
      limit: 25,
      totalPages: 1,
      totalItems: items.length,
      ...paginationOverrides
    }
  };
}
