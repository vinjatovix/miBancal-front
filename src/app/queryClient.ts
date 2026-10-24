import { QueryCache, QueryClient, type Query } from '@tanstack/react-query';

import { classifyFailure } from '../shared/errors/classifyFailure';
import {
  reportUnexpectedError,
  shouldReportFailure,
  toUnexpectedErrorReport
} from '../shared/observability/reportUnexpectedError';
import { shouldRetryQuery } from '../shared/reactQuery/retryPolicy';

function reportQueryError(error: unknown, query: Pick<Query, 'meta'>): void {
  const kind = classifyFailure(error, query.meta);
  if (shouldReportFailure(kind)) {
    reportUnexpectedError(toUnexpectedErrorReport(error, { kind }), error);
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: reportQueryError }),
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false
    }
  }
});
