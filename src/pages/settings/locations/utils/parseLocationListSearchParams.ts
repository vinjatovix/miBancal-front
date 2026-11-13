import {
  DEFAULT_LOCATION_SORT,
  LOCATION_SORT_FIELDS,
  type LocationListRequest,
  type LocationSort
} from '../../../../services/locationListQuery';
import { SORT_DIRECTIONS } from '../../../../services/listQuery';
import { SUPPORTED_LIMITS } from '../../../../shared/components/constants';
import { LOCATION_LIST_URL_PARAMS } from '../../../../shared/constants/locationListUrlParams';
import { parsePositiveInt } from '../../../../shared/utils/parsePositiveInt';
import { pickAllowed } from '../../../../shared/utils/pickAllowed';
import type { PaginationParams } from '../../../../types/Pagination';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT: number = SUPPORTED_LIMITS[0];

function parseSort(params: URLSearchParams): LocationSort {
  return {
    field:
      pickAllowed(
        params.getAll(LOCATION_LIST_URL_PARAMS.sortField),
        LOCATION_SORT_FIELDS
      ) ?? DEFAULT_LOCATION_SORT.field,
    direction:
      pickAllowed(
        params.getAll(LOCATION_LIST_URL_PARAMS.sortDirection),
        SORT_DIRECTIONS
      ) ?? DEFAULT_LOCATION_SORT.direction
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
      params.get(LOCATION_LIST_URL_PARAMS.page),
      DEFAULT_PAGE
    ),
    limit: parseLimit(params.get(LOCATION_LIST_URL_PARAMS.limit))
  };
}

export function parseLocationListSearchParams(
  params: URLSearchParams
): LocationListRequest {
  return {
    pagination: parsePagination(params),
    sort: parseSort(params)
  };
}
