import {
  ANOMALY_SORT_FIELDS,
  DEFAULT_ANOMALY_SORT,
  type AnomalyFilterParams,
  type AnomalyListRequest,
  type AnomalySort,
  type AnomalySortField
} from '../../../services/anomalyListQuery';
import {
  SORT_DIRECTIONS,
  type SortDirection
} from '../../../services/listQuery';
import { SUPPORTED_LIMITS } from '../../../shared/components/constants';
import { ANOMALY_LIST_URL_PARAMS } from '../../../shared/constants/anomalyListUrlParams';
import { parsePositiveInt } from '../../../shared/utils/parsePositiveInt';
import { pickAllowed } from '../../../shared/utils/pickAllowed';
import { ANOMALY_CATEGORIES } from '../../../types/Anomaly/Anomaly';
import type { PaginationParams } from '../../../types/Pagination';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT: number = SUPPORTED_LIMITS[0];

function parseSort(params: URLSearchParams): AnomalySort {
  return {
    field:
      pickAllowed(
        params.getAll(ANOMALY_LIST_URL_PARAMS.sortField),
        ANOMALY_SORT_FIELDS
      ) ?? DEFAULT_ANOMALY_SORT.field,
    direction:
      pickAllowed(
        params.getAll(ANOMALY_LIST_URL_PARAMS.sortDirection),
        SORT_DIRECTIONS
      ) ?? DEFAULT_ANOMALY_SORT.direction
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
      params.get(ANOMALY_LIST_URL_PARAMS.page),
      DEFAULT_PAGE
    ),
    limit: parseLimit(params.get(ANOMALY_LIST_URL_PARAMS.limit))
  };
}

function parseFilters(params: URLSearchParams): AnomalyFilterParams {
  const category = pickAllowed(
    params.getAll(ANOMALY_LIST_URL_PARAMS.category),
    ANOMALY_CATEGORIES
  );
  return {
    ...(category ? { category } : {})
  };
}

export function parseAnomalyListSearchParams(
  params: URLSearchParams
): AnomalyListRequest {
  return {
    filters: parseFilters(params),
    pagination: parsePagination(params),
    sort: parseSort(params)
  };
}

export function countActiveFilters(request: AnomalyListRequest): number {
  return Object.keys(request.filters).length;
}

export function withoutListPage(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete(ANOMALY_LIST_URL_PARAMS.page);
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

export function withListPage(
  params: URLSearchParams,
  page: number
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set(ANOMALY_LIST_URL_PARAMS.page, String(page));
  return next;
}

export function withListSort(
  params: URLSearchParams,
  field: AnomalySortField,
  direction: SortDirection
): URLSearchParams {
  const next = withoutListPage(params);
  next.set(ANOMALY_LIST_URL_PARAMS.sortField, field);
  next.set(ANOMALY_LIST_URL_PARAMS.sortDirection, direction);
  return next;
}
