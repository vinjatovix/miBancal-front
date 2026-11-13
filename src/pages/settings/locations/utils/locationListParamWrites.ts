import type { LocationSortField } from '../../../../services/locationListQuery';
import type { SortDirection } from '../../../../services/listQuery';
import { LOCATION_LIST_URL_PARAMS } from '../../../../shared/constants/locationListUrlParams';

export function withoutLocationListPage(
  params: URLSearchParams
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete(LOCATION_LIST_URL_PARAMS.page);
  return next;
}

export function withLocationListPage(
  params: URLSearchParams,
  page: number
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set(LOCATION_LIST_URL_PARAMS.page, String(page));
  return next;
}

export function withLocationListLimit(
  params: URLSearchParams,
  limit: number
): URLSearchParams {
  const next = withoutLocationListPage(params);
  next.set(LOCATION_LIST_URL_PARAMS.limit, String(limit));
  return next;
}

export function withLocationListSort(
  params: URLSearchParams,
  field: LocationSortField,
  direction: SortDirection
): URLSearchParams {
  const next = withoutLocationListPage(params);
  next.set(LOCATION_LIST_URL_PARAMS.sortField, field);
  next.set(LOCATION_LIST_URL_PARAMS.sortDirection, direction);
  return next;
}
