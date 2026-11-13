export const GARDEN_INPUT_LIST_URL_PARAMS = {
  page: 'page',
  limit: 'limit',
  sortField: 'sortField',
  sortDirection: 'sortDirection',
  category: 'category',
  action: 'action',
  status: 'status'
} as const;

export const GARDEN_INPUT_LIST_FILTER_URL_PARAMS: readonly string[] = [
  GARDEN_INPUT_LIST_URL_PARAMS.category,
  GARDEN_INPUT_LIST_URL_PARAMS.action,
  GARDEN_INPUT_LIST_URL_PARAMS.status
];

export function withoutGardenInputListFilters(
  params: URLSearchParams
): URLSearchParams {
  const next = new URLSearchParams(params);
  GARDEN_INPUT_LIST_FILTER_URL_PARAMS.forEach((param) => next.delete(param));
  next.delete(GARDEN_INPUT_LIST_URL_PARAMS.page);
  return next;
}
