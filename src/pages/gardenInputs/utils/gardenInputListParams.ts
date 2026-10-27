import {
  DEFAULT_GARDEN_INPUT_SORT,
  GARDEN_INPUT_SORT_FIELDS,
  type GardenInputFilterParams,
  type GardenInputListRequest,
  type GardenInputSort,
  type GardenInputSortField
} from '../../../services/gardenInputListQuery';
import {
  SORT_DIRECTIONS,
  type SortDirection
} from '../../../services/listQuery';
import { SUPPORTED_LIMITS } from '../../../shared/components/constants';
import { GARDEN_INPUT_LIST_URL_PARAMS } from '../../../shared/constants/gardenInputListUrlParams';
import { parsePositiveInt } from '../../../shared/utils/parsePositiveInt';
import { pickAllowed } from '../../../shared/utils/pickAllowed';
import {
  GARDEN_INPUT_ACTIONS,
  GARDEN_INPUT_CATEGORIES,
  GARDEN_INPUT_STATUSES,
  type GardenInputAction,
  type GardenInputCategory
} from '../../../types/GardenInput/GardenInput';
import type { PaginationParams } from '../../../types/Pagination';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT: number = SUPPORTED_LIMITS[0];

function parseSort(params: URLSearchParams): GardenInputSort {
  return {
    field:
      pickAllowed(
        params.getAll(GARDEN_INPUT_LIST_URL_PARAMS.sortField),
        GARDEN_INPUT_SORT_FIELDS
      ) ?? DEFAULT_GARDEN_INPUT_SORT.field,
    direction:
      pickAllowed(
        params.getAll(GARDEN_INPUT_LIST_URL_PARAMS.sortDirection),
        SORT_DIRECTIONS
      ) ?? DEFAULT_GARDEN_INPUT_SORT.direction
  };
}

function parseLimit(value: string | null): number {
  const limit = parsePositiveInt(value, DEFAULT_LIMIT);
  return (SUPPORTED_LIMITS as readonly number[]).includes(limit)
    ? limit
    : DEFAULT_LIMIT;
}

function parsePagination(params: URLSearchParams): PaginationParams {
  return {
    page: parsePositiveInt(
      params.get(GARDEN_INPUT_LIST_URL_PARAMS.page),
      DEFAULT_PAGE
    ),
    limit: parseLimit(params.get(GARDEN_INPUT_LIST_URL_PARAMS.limit))
  };
}

function parseListValues<T extends string>(
  rawValues: string[],
  allowed: readonly T[]
): T[] | undefined {
  const allowedSet = new Set<string>(allowed);
  const result: T[] = [];

  for (const raw of rawValues) {
    const parts = raw.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (allowedSet.has(trimmed) && !result.includes(trimmed as T)) {
        result.push(trimmed as T);
      }
    }
  }

  return result.length > 0 ? result : undefined;
}

function parseFilters(params: URLSearchParams): GardenInputFilterParams {
  const category = parseListValues<GardenInputCategory>(
    params.getAll(GARDEN_INPUT_LIST_URL_PARAMS.category),
    GARDEN_INPUT_CATEGORIES
  );
  const action = parseListValues<GardenInputAction>(
    params.getAll(GARDEN_INPUT_LIST_URL_PARAMS.action),
    GARDEN_INPUT_ACTIONS
  );
  const status = pickAllowed(
    params.getAll(GARDEN_INPUT_LIST_URL_PARAMS.status),
    GARDEN_INPUT_STATUSES
  );

  return {
    ...(category ? { category } : {}),
    ...(action ? { action } : {}),
    ...(status ? { status } : {})
  };
}

export function parseGardenInputListSearchParams(
  params: URLSearchParams
): GardenInputListRequest {
  return {
    filters: parseFilters(params),
    pagination: parsePagination(params),
    sort: parseSort(params)
  };
}

export function countActiveFilters(request: GardenInputListRequest): number {
  let count = 0;
  if (request.filters.category && request.filters.category.length > 0) {
    count++;
  }
  if (request.filters.action && request.filters.action.length > 0) {
    count++;
  }
  if (request.filters.status) {
    count++;
  }
  return count;
}

export function withoutListPage(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete(GARDEN_INPUT_LIST_URL_PARAMS.page);
  return next;
}

export function withListPage(
  params: URLSearchParams,
  page: number
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set(GARDEN_INPUT_LIST_URL_PARAMS.page, String(page));
  return next;
}

export function withListParam(
  params: URLSearchParams,
  key: string,
  value: string
): URLSearchParams {
  const next = withoutListPage(params);
  if (value === '') {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  return next;
}

export function withListSort(
  params: URLSearchParams,
  field: GardenInputSortField,
  direction: SortDirection
): URLSearchParams {
  const next = withoutListPage(params);
  next.set(GARDEN_INPUT_LIST_URL_PARAMS.sortField, field);
  next.set(GARDEN_INPUT_LIST_URL_PARAMS.sortDirection, direction);
  return next;
}

export function withMultiFilterToggle(
  params: URLSearchParams,
  key: string,
  item: string
): URLSearchParams {
  const next = withoutListPage(params);
  const rawValues = next.getAll(key);
  const list = rawValues
    .flatMap((v) => v.split(','))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const exists = list.includes(item);

  const updated = exists ? list.filter((i) => i !== item) : [...list, item];

  next.delete(key);
  if (updated.length > 0) {
    next.set(key, updated.join(','));
  }

  return next;
}
