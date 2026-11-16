import { QueryBuilder } from '../shared/api/QueryBuilder';
import {
  PAGINATION_LIMIT_MAX,
  PAGINATION_QUERY_KEYS,
  type SortDirection
} from './listQuery';

export const PLANT_INSTANCE_FILTER_QUERY_KEYS = {
  bedId: 'filter[bedId][eq]',
  plantId: 'filter[plantId][eq]'
} as const;

export const PLANT_INSTANCE_SORT_QUERY_KEY = 'sort[plantedAt]';

export interface PlantInstanceListRequest {
  readonly bedId?: string;
  readonly plantId?: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sort?: SortDirection;
}

function clampLimit(limit?: number): number | undefined {
  if (limit === undefined) {
    return undefined;
  }
  return Math.min(limit, PAGINATION_LIMIT_MAX);
}

export function buildPlantInstanceListQuery(
  request?: PlantInstanceListRequest
): string {
  if (!request) {
    return '';
  }

  return QueryBuilder.create()
    .add(PLANT_INSTANCE_FILTER_QUERY_KEYS.bedId, request.bedId)
    .add(PLANT_INSTANCE_FILTER_QUERY_KEYS.plantId, request.plantId)
    .add(PAGINATION_QUERY_KEYS.page, request.page)
    .add(PAGINATION_QUERY_KEYS.limit, clampLimit(request.limit))
    .add(PLANT_INSTANCE_SORT_QUERY_KEY, request.sort)
    .build();
}
