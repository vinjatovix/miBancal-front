import type { PaginationParams } from '../types/Pagination';
import { pickAllowed } from '../shared/utils/pickAllowed';
import type { SortDirection } from './listQuery';

export const BOOLEAN_FILTER_VALUES = ['true', 'false'] as const;

export type BooleanFilterValue = (typeof BOOLEAN_FILTER_VALUES)[number];

export type PlantFilterParams = {
  identity?: string;
  genus?: string;
  family?: string;
  lifeCycle?: 'annual' | 'biennial' | 'perennial';
  spacingCm?: string;

  sowingMonths?: number[];
  sowingMethod?: 'direct' | 'starter';

  soilPh?: string;
  soilAvailableDepthCm?: string;

  lightHoursMin?: string;
  lightType?: 'full_sun' | 'partial_shade';

  rootSystem?:
    | 'fibrous'
    | 'taproot'
    | 'adventitious'
    | 'rhizome'
    | 'tuber'
    | 'fasciculate';

  edible?: BooleanFilterValue;
  toxic?: BooleanFilterValue;

  bookmarked?: BooleanFilterValue;
};

export const PLANT_SORT_FIELDS = ['name', 'scientificName'] as const;

export type PlantsSortField = (typeof PLANT_SORT_FIELDS)[number];

export type PlantSort = {
  readonly field: PlantsSortField;
  readonly direction: SortDirection;
};

export type PlantListRequest = {
  readonly filters: PlantFilterParams;
  readonly pagination: PaginationParams;
  readonly sort: PlantSort;
};

export const DEFAULT_PLANT_SORT: PlantSort = {
  field: 'name',
  direction: 'asc'
};

export const PLANT_FILTER_QUERY_KEYS: Record<keyof PlantFilterParams, string> =
  {
    identity: 'filter[identity][contains]',
    genus: 'filter[genus][eq]',
    family: 'filter[family][eq]',
    lifeCycle: 'filter[lifeCycle][eq]',
    edible: 'filter[edible][eq]',
    toxic: 'filter[toxic][eq]',
    sowingMethod: 'filter[sowingMethod][eq]',
    sowingMonths: 'filter[sowingMonths][hasAny]',
    soilPh: 'filter[soilPh][eq]',
    soilAvailableDepthCm: 'filter[soilAvailableDepthCm][eq]',
    spacingCm: 'filter[spacingCm][eq]',
    lightType: 'filter[lightType][eq]',
    lightHoursMin: 'filter[lightHoursMin][eq]',
    rootSystem: 'filter[rootSystem][eq]',
    bookmarked: 'filter[bookmarked][eq]'
  };

export const PLANT_FIELDS_QUERY_KEY = 'fields[plants]';

export const PLANT_FIELDS = [
  'id',
  'slug',
  'identity',
  'traits',
  'phenology',
  'knowledge',
  'image',
  'metadata',
  'status',
  'deletedAt',
  'version',
  'likesCount'
] as const;

export type PlantField = (typeof PLANT_FIELDS)[number];

export const PLANT_LIST_FIELDS: readonly PlantField[] = [
  'slug',
  'identity',
  'traits',
  'image',
  'status',
  'likesCount'
];

export const FAMILY_PLANTS_FIELDS: readonly PlantField[] = [
  'slug',
  'identity',
  'status'
];

export function sortQueryKey(field: PlantsSortField): string {
  return `sort[${field}]`;
}

export function isPlantsSortField(value: string): value is PlantsSortField {
  return (PLANT_SORT_FIELDS as readonly string[]).includes(value);
}

export function parseBooleanFilter(
  values: readonly string[]
): BooleanFilterValue | undefined {
  return pickAllowed(values, BOOLEAN_FILTER_VALUES);
}
