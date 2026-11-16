import { QueryBuilder } from '../shared/api/QueryBuilder';
import type { PlantRelationListRequest } from '../types/Plants/PlantRelation';
import { PAGINATION_LIMIT_MAX, PAGINATION_QUERY_KEYS } from './listQuery';

export const PLANT_RELATION_FILTER_QUERY_KEYS = {
  appliesToPlantId: 'filter[appliesToPlantId][eq]',
  sourceScope: 'filter[sourceScope][eq]',
  targetScope: 'filter[targetScope][eq]',
  genus: 'filter[genus][eq]',
  familyId: 'filter[familyId][eq]',
  plantId: 'filter[plantId][eq]',
  sourcePlantId: 'filter[sourcePlantId][eq]',
  targetPlantId: 'filter[targetPlantId][eq]',
  type: 'filter[type][eq]',
  mechanism: 'filter[mechanism][eq]'
} as const;

export const DEFAULT_PLANT_RELATION_SORT = 'createdAt:desc';
export const DEFAULT_PLANT_RELATION_INCLUDES = [
  'sourcePlant',
  'targetPlant',
  'sourceFamily',
  'targetFamily'
] as const;

const FILTER_FIELDS = [
  'appliesToPlantId',
  'plantId',
  'sourcePlantId',
  'targetPlantId',
  'sourceScope',
  'targetScope',
  'genus',
  'familyId',
  'type',
  'mechanism'
] as const;

export function buildPlantRelationsQuery(
  request: PlantRelationListRequest = {}
): string {
  let builder = QueryBuilder.create();

  for (const field of FILTER_FIELDS) {
    const value = request.filters?.[field];
    if (value) {
      builder = builder.add(PLANT_RELATION_FILTER_QUERY_KEYS[field], value);
    }
  }

  if (request.sort) {
    builder = builder.add('sort', request.sort);
  }

  if (request.pagination?.page !== undefined) {
    builder = builder.add(PAGINATION_QUERY_KEYS.page, request.pagination.page);
  }

  if (request.pagination?.limit !== undefined) {
    const limit = Math.min(request.pagination.limit, PAGINATION_LIMIT_MAX);
    builder = builder.add(PAGINATION_QUERY_KEYS.limit, limit);
  }

  const includes = request.include ?? DEFAULT_PLANT_RELATION_INCLUDES;
  if (includes.length > 0) {
    builder = builder.add('include', includes.join(','));
  }

  return builder.build();
}
