import '@tanstack/react-query';

import type { ClassifyFailureOptions } from '../errors/classifyFailure';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: ClassifyFailureOptions;
  }
}

export const DETAIL_QUERY_META: ClassifyFailureOptions = {
  badRequestMeansNotFound: true
};
