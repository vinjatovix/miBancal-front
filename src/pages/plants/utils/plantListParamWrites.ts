import type { SortDirection } from '../../../services/listQuery';
import type { PlantsSortField } from '../../../services/plantListQuery';
import { PLANT_LIST_URL_PARAMS } from '../../../shared/constants/plantListUrlParams';

export function withoutListPage(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  next.delete(PLANT_LIST_URL_PARAMS.page);
  return next;
}

export function withListParam(
  params: URLSearchParams,
  key: string,
  value: string
): URLSearchParams {
  const next = withoutListPage(params);
  next.set(key, value);
  return next;
}

export function withoutListParam(
  params: URLSearchParams,
  key: string
): URLSearchParams {
  const next = withoutListPage(params);
  next.delete(key);
  return next;
}

export function withListPage(
  params: URLSearchParams,
  page: number
): URLSearchParams {
  const next = new URLSearchParams(params);
  next.set(PLANT_LIST_URL_PARAMS.page, String(page));
  return next;
}

export function withListSort(
  params: URLSearchParams,
  field: PlantsSortField,
  direction: SortDirection
): URLSearchParams {
  const next = withoutListPage(params);
  next.set(PLANT_LIST_URL_PARAMS.sortField, field);
  next.set(PLANT_LIST_URL_PARAMS.sortDirection, direction);
  return next;
}
