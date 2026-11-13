import { QueryCache, QueryClient, type Query } from '@tanstack/react-query';

import { classifyFailure } from '../shared/errors/classifyFailure';
import {
  reportUnexpectedError,
  shouldReportFailure,
  toUnexpectedErrorReport
} from '../shared/observability/reportUnexpectedError';
import { shouldRetryQuery } from '../shared/reactQuery/retryPolicy';
import { showErrorToast } from '../shared/toast/showErrorToast';

function handleQueryError(error: unknown, query: Pick<Query, 'meta'>): void {
  const kind = classifyFailure(error, query.meta);
  if (kind === 'tooManyRequests') {
    showErrorToast(error);
  }
  if (shouldReportFailure(kind)) {
    reportUnexpectedError(toUnexpectedErrorReport(error, { kind }), error);
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleQueryError }),
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false
    }
  }
});
