import { QueryBuilder } from '../shared/api/QueryBuilder';
import type { PaginationParams } from '../types/Pagination';
import { PAGINATION_QUERY_KEYS, type SortDirection } from './listQuery';

export const LOCATION_SORT_FIELDS = ['name', 'createdAt'] as const;

export type LocationSortField = (typeof LOCATION_SORT_FIELDS)[number];

export type LocationSort = {
  readonly field: LocationSortField;
  readonly direction: SortDirection;
};

export const DEFAULT_LOCATION_SORT: LocationSort = {
  field: 'name',
  direction: 'asc'
};

export type LocationListRequest = {
  readonly pagination: PaginationParams;
  readonly sort: LocationSort;
};

export function sortQueryKey(field: LocationSortField): string {
  return `sort[${field}]`;
}

export function isLocationSortField(value: string): value is LocationSortField {
  return (LOCATION_SORT_FIELDS as readonly string[]).includes(value);
}

export function buildLocationListQuery({
  pagination,
  sort
}: LocationListRequest): string {
  return QueryBuilder.create()
    .add(PAGINATION_QUERY_KEYS.page, pagination.page)
    .add(PAGINATION_QUERY_KEYS.limit, pagination.limit)
    .add(sortQueryKey(sort.field), sort.direction)
    .build();
}
