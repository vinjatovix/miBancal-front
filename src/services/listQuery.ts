export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export const PAGINATION_QUERY_KEYS = {
  page: 'pagination[page]',
  limit: 'pagination[limit]'
} as const;

export const PAGINATION_LIMIT_MAX = 100;

export function isSortDirection(value: string): value is SortDirection {
  return (SORT_DIRECTIONS as readonly string[]).includes(value);
}
