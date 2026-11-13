import type { UseQueryResult } from '@tanstack/react-query';

export type QueryViewState = 'loading' | 'error' | 'success';

export function getQueryViewState(
  query: Pick<UseQueryResult, 'data' | 'isError' | 'isFetching'>
): QueryViewState {
  if (query.data !== undefined) return 'success';
  if (query.isError && !query.isFetching) return 'error';
  return 'loading';
}
