import type { PaginationParams } from '../types/Pagination';
import type { AnomalyCategory } from '../types/Anomaly/Anomaly';
import type { SortDirection } from './listQuery';

export type AnomalyFilterParams = {
  category?: AnomalyCategory;
};

export const ANOMALY_FILTER_QUERY_KEYS: Record<
  keyof AnomalyFilterParams,
  string
> = {
  category: 'filter[category][eq]'
};

export const ANOMALY_FIELDS_QUERY_KEY = 'fields[anomalies]';

type AnomalyField =
  | 'slug'
  | 'name'
  | 'scientificName'
  | 'category'
  | 'status'
  | 'deletedAt';

export const ANOMALY_LIST_FIELDS: readonly AnomalyField[] = [
  'slug',
  'name',
  'scientificName',
  'category',
  'status',
  'deletedAt'
];

export const ANOMALY_SORT_FIELDS = ['name', 'slug'] as const;

export type AnomalySortField = (typeof ANOMALY_SORT_FIELDS)[number];

export type AnomalySort = {
  readonly field: AnomalySortField;
  readonly direction: SortDirection;
};

export const DEFAULT_ANOMALY_SORT: AnomalySort = {
  field: 'name',
  direction: 'asc'
};

export type AnomalyListRequest = {
  readonly filters: AnomalyFilterParams;
  readonly pagination: PaginationParams;
  readonly sort: AnomalySort;
};

export function anomalySortQueryKey(field: AnomalySortField): string {
  return `sort[${field}]`;
}

export function isAnomalySortField(value: string): value is AnomalySortField {
  return (ANOMALY_SORT_FIELDS as readonly string[]).includes(value);
}
