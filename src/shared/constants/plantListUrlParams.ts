export const PLANT_LIST_URL_PARAMS = {
  page: 'page',
  limit: 'limit',
  sortField: 'sortField',
  sortDirection: 'sortDirection',
  identity: 'identity',
  family: 'family',
  lifeCycle: 'lifeCycle',
  sowingMethod: 'sowingMethod',
  lightType: 'lightType',
  rootSystem: 'rootSystem',
  edible: 'edible',
  toxic: 'toxic',
  sowingMonth: 'sowingMonth',
  soilPh: 'soilPh',
  lightHoursMin: 'lightHoursMin',
  spacingCm: 'spacingCm',
  soilAvailableDepthCm: 'soilAvailableDepthCm',
  hemisphere: 'hemisphere',
  tab: 'tab'
} as const;

export const FAVORITES_TAB_VALUE = 'favorites';

export function isFavoritesTab(params: URLSearchParams): boolean {
  return params.get(PLANT_LIST_URL_PARAMS.tab) === FAVORITES_TAB_VALUE;
}

const NON_FILTER_URL_PARAMS: ReadonlySet<string> = new Set([
  PLANT_LIST_URL_PARAMS.page,
  PLANT_LIST_URL_PARAMS.limit,
  PLANT_LIST_URL_PARAMS.sortField,
  PLANT_LIST_URL_PARAMS.sortDirection,
  PLANT_LIST_URL_PARAMS.hemisphere,
  PLANT_LIST_URL_PARAMS.tab
]);

export const PLANT_LIST_FILTER_URL_PARAMS: readonly string[] = Object.values(
  PLANT_LIST_URL_PARAMS
).filter((param) => !NON_FILTER_URL_PARAMS.has(param));

export function withoutPlantListFilters(
  params: URLSearchParams
): URLSearchParams {
  const next = new URLSearchParams(params);
  PLANT_LIST_FILTER_URL_PARAMS.forEach((param) => next.delete(param));
  next.delete(PLANT_LIST_URL_PARAMS.page);
  return next;
}
