import type { SortDirection } from './listQuery';

export const FAMILY_FIELDS_QUERY_KEY = 'fields[families]';

type FamilyField =
  | 'id'
  | 'slug'
  | 'name'
  | 'aliases'
  | 'scientificName'
  | 'shortDescription'
  | 'highlights'
  | 'extra'
  | 'metadata'
  | 'version';

export const FAMILY_LIST_FIELDS: readonly FamilyField[] = [
  'name',
  'scientificName'
];

export const FAMILY_SORT_QUERY_KEYS = {
  name: 'sort[name]'
} as const;

export const FAMILY_LIST_SORT_DIRECTION: SortDirection = 'asc';
