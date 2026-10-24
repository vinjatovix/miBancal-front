export const ANOMALY_LIST_URL_PARAMS = {
  page: 'page',
  limit: 'limit',
  sortField: 'sortField',
  sortDirection: 'sortDirection',
  category: 'category'
} as const;

export const ANOMALY_LIST_FILTER_URL_PARAMS: readonly string[] = [
  ANOMALY_LIST_URL_PARAMS.category
];

export function withoutAnomalyListFilters(
  params: URLSearchParams
): URLSearchParams {
  const next = new URLSearchParams(params);
  ANOMALY_LIST_FILTER_URL_PARAMS.forEach((param) => next.delete(param));
  next.delete(ANOMALY_LIST_URL_PARAMS.page);
  return next;
}
