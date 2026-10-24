import {
  DEFAULT_PLANT_SORT,
  PLANT_SORT_FIELDS,
  parseBooleanFilter,
  type PlantFilterParams,
  type PlantListRequest,
  type PlantSort
} from '../../../services/plantListQuery';
import { SORT_DIRECTIONS } from '../../../services/listQuery';
import type { PaginationParams } from '../../../types/Pagination';
import { SUPPORTED_LIMITS } from '../../../shared/components/constants';
import { FILTER_TEXT_MAX_LENGTH } from '../../../shared/constants/filterText';
import { PLANT_LIST_URL_PARAMS } from '../../../shared/constants/plantListUrlParams';
import { isUuid } from '../../../shared/utils/isUuid';
import { parseDecimalString } from '../../../shared/utils/parseDecimalString';
import { parseFilterText } from '../../../shared/utils/parseFilterText';
import { parseMonthList } from '../../../shared/utils/parseMonthList';
import { parsePositiveInt } from '../../../shared/utils/parsePositiveInt';
import { pickAllowed } from '../../../shared/utils/pickAllowed';
import {
  LIFE_CYCLES,
  LIGHT_TYPES,
  ROOT_SYSTEMS,
  SOWING_METHODS
} from '../../../components/plants/PlantFilters/constants';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT: number = SUPPORTED_LIMITS[0];

type Read = (name: string) => string | null;

function parseSort(params: URLSearchParams): PlantSort {
  return {
    field:
      pickAllowed(
        params.getAll(PLANT_LIST_URL_PARAMS.sortField),
        PLANT_SORT_FIELDS
      ) ?? DEFAULT_PLANT_SORT.field,
    direction:
      pickAllowed(
        params.getAll(PLANT_LIST_URL_PARAMS.sortDirection),
        SORT_DIRECTIONS
      ) ?? DEFAULT_PLANT_SORT.direction
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
      params.get(PLANT_LIST_URL_PARAMS.page),
      DEFAULT_PAGE
    ),
    limit: parseLimit(params.get(PLANT_LIST_URL_PARAMS.limit))
  };
}

function pickOne<T extends string>(
  value: string | null,
  allowed: readonly T[]
): T | undefined {
  return value === null ? undefined : pickAllowed([value], allowed);
}

function parseFamily(value: string | null): string | undefined {
  const trimmed = value?.trim();
  return trimmed && isUuid(trimmed) ? trimmed : undefined;
}

function parseTextFilters(read: Read): PlantFilterParams {
  return {
    identity: parseFilterText(
      read(PLANT_LIST_URL_PARAMS.identity),
      FILTER_TEXT_MAX_LENGTH
    ),
    family: parseFamily(read(PLANT_LIST_URL_PARAMS.family)),
    lifeCycle: pickOne(read(PLANT_LIST_URL_PARAMS.lifeCycle), LIFE_CYCLES),
    sowingMethod: pickOne(
      read(PLANT_LIST_URL_PARAMS.sowingMethod),
      SOWING_METHODS
    ),
    lightType: pickOne(read(PLANT_LIST_URL_PARAMS.lightType), LIGHT_TYPES),
    rootSystem: pickOne(read(PLANT_LIST_URL_PARAMS.rootSystem), ROOT_SYSTEMS)
  };
}

function parseNumericFilters(
  read: Read,
  params: URLSearchParams
): PlantFilterParams {
  return {
    sowingMonths: parseMonthList(
      params.getAll(PLANT_LIST_URL_PARAMS.sowingMonth)
    ),
    soilPh: parseDecimalString(read(PLANT_LIST_URL_PARAMS.soilPh)),
    soilAvailableDepthCm: parseDecimalString(
      read(PLANT_LIST_URL_PARAMS.soilAvailableDepthCm)
    ),
    spacingCm: parseDecimalString(read(PLANT_LIST_URL_PARAMS.spacingCm)),
    lightHoursMin: parseDecimalString(read(PLANT_LIST_URL_PARAMS.lightHoursMin))
  };
}

function parseBooleanFilters(params: URLSearchParams): PlantFilterParams {
  return {
    edible: parseBooleanFilter(params.getAll(PLANT_LIST_URL_PARAMS.edible)),
    toxic: parseBooleanFilter(params.getAll(PLANT_LIST_URL_PARAMS.toxic))
  };
}

function withoutUndefined(filters: PlantFilterParams): PlantFilterParams {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined)
  );
}

function parseFilters(params: URLSearchParams): PlantFilterParams {
  const read: Read = (name) => params.get(name);
  return withoutUndefined({
    ...parseTextFilters(read),
    ...parseNumericFilters(read, params),
    ...parseBooleanFilters(params)
  });
}

export function parsePlantListSearchParams(
  params: URLSearchParams
): PlantListRequest {
  return {
    filters: parseFilters(params),
    pagination: parsePagination(params),
    sort: parseSort(params)
  };
}
