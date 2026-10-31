export const QUERY_CACHE_TIMES = {
  ONE_MINUTE: 1000 * 60,
  FIVE_MINUTES: 1000 * 60 * 5,
  TEN_MINUTES: 1000 * 60 * 10,

  ONE_HOUR: 1000 * 60 * 60,
  SIX_HOURS: 1000 * 60 * 60 * 6,
  ONE_DAY: 1000 * 60 * 60 * 24,
  SEVEN_DAYS: 1000 * 60 * 60 * 24 * 7
} as const;

export const QUERY_DEFAULTS = {
  staleTime: QUERY_CACHE_TIMES.ONE_DAY,
  gcTime: QUERY_CACHE_TIMES.SEVEN_DAYS
} as const;
