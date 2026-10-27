import { QueryBuilder } from '../shared/api/QueryBuilder';
import type {
  GardenInputAction,
  GardenInputCategory,
  GardenInputListItem,
  GardenInputStatus
} from '../types/GardenInput/GardenInput';
import type { PaginationParams } from '../types/Pagination';
import { PAGINATION_QUERY_KEYS, type SortDirection } from './listQuery';

export type GardenInputFilterParams = {
  category?: GardenInputCategory | GardenInputCategory[] | string;
  action?: GardenInputAction | GardenInputAction[] | string;
  status?: GardenInputStatus | GardenInputStatus[] | string;
};

export const GARDEN_INPUT_FIELDS_QUERY_KEY = 'fields[gardenInputs]';

export const GARDEN_INPUT_LIST_FIELDS: readonly (keyof GardenInputListItem)[] =
  [
    'id',
    'slug',
    'name',
    'category',
    'actions',
    'description',
    'status',
    'deletedAt'
  ];

export const GARDEN_INPUT_SORT_FIELDS = ['name', 'slug', 'category'] as const;

export type GardenInputSortField = (typeof GARDEN_INPUT_SORT_FIELDS)[number];

export type GardenInputSort = {
  readonly field: GardenInputSortField;
  readonly direction: SortDirection;
};

export const DEFAULT_GARDEN_INPUT_SORT: GardenInputSort = {
  field: 'name',
  direction: 'asc'
};

export type GardenInputListRequest = {
  readonly filters: GardenInputFilterParams;
  readonly pagination: PaginationParams;
  readonly sort: GardenInputSort;
};

export function gardenInputSortQueryKey(field: GardenInputSortField): string {
  return `sort[${field}]`;
}

export function isGardenInputSortField(
  value: string
): value is GardenInputSortField {
  return (GARDEN_INPUT_SORT_FIELDS as readonly string[]).includes(value);
}

function normalizeListParam(
  value: string | readonly string[] | undefined
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    return value.length > 0 ? value.join(',') : undefined;
  }
  const trimmed = value.trim();
  return trimmed !== '' ? trimmed : undefined;
}

function addCategoryFilter(
  query: QueryBuilder,
  category?: GardenInputCategory | GardenInputCategory[] | string
): QueryBuilder {
  const serialized = normalizeListParam(category);
  if (!serialized) {
    return query;
  }
  return query.add('filter[category][in]', serialized);
}

function addActionFilter(
  query: QueryBuilder,
  action?: GardenInputAction | GardenInputAction[] | string
): QueryBuilder {
  const serialized = normalizeListParam(action);
  if (!serialized) {
    return query;
  }
  return query.add('filter[action][in]', serialized);
}

function addStatusFilter(
  query: QueryBuilder,
  status?: GardenInputStatus | GardenInputStatus[] | string
): QueryBuilder {
  if (!status) {
    return query;
  }
  if (Array.isArray(status)) {
    if (status.length === 1) {
      return query.add('filter[status][eq]', status[0]);
    }
    if (status.length > 1) {
      return query.add('filter[status][in]', status.join(','));
    }
    return query;
  }
  const statusStr = typeof status === 'string' ? status : String(status);
  const trimmed = statusStr.trim();
  if (trimmed === '') {
    return query;
  }
  if (trimmed.includes(',')) {
    return query.add('filter[status][in]', trimmed);
  }
  return query.add('filter[status][eq]', trimmed);
}

export function buildGardenInputQuery({
  filters,
  pagination,
  sort
}: GardenInputListRequest): string {
  let builder = QueryBuilder.create()
    .add(PAGINATION_QUERY_KEYS.page, pagination.page)
    .add(PAGINATION_QUERY_KEYS.limit, pagination.limit)
    .add(gardenInputSortQueryKey(sort.field), sort.direction)
    .add(GARDEN_INPUT_FIELDS_QUERY_KEY, GARDEN_INPUT_LIST_FIELDS.join(','));

  builder = addCategoryFilter(builder, filters.category);
  builder = addActionFilter(builder, filters.action);
  builder = addStatusFilter(builder, filters.status);

  return builder.build();
}
