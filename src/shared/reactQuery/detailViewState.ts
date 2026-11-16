import type { UseQueryResult } from '@tanstack/react-query';

import { classifyFailure } from '../errors/classifyFailure';
import { DETAIL_QUERY_META } from './queryMeta';
import { getQueryViewState, type QueryViewState } from './queryViewState';

export type DetailViewState = QueryViewState | 'notFound';

export function getDetailViewState(
  id: string | undefined,
  query: Pick<UseQueryResult, 'data' | 'isError' | 'isFetching' | 'error'>
): DetailViewState {
  if (!id) return 'notFound';
  const viewState = getQueryViewState(query);
  if (
    viewState === 'error' &&
    classifyFailure(query.error, DETAIL_QUERY_META) === 'notFound'
  ) {
    return 'notFound';
  }
  return viewState;
}
