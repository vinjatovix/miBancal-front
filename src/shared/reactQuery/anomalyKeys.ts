import type { AnomalyListRequest } from '../../services/anomalyListQuery';

export type AnomalyRoleScope = 'editorial' | 'public';

export const anomalyKeys = {
  all: ['anomalies'] as const,
  list: (request: AnomalyListRequest, scope?: AnomalyRoleScope) =>
    scope !== undefined
      ? ([...anomalyKeys.all, 'list', request, scope] as const)
      : ([...anomalyKeys.all, 'list', request] as const),
  detail: (slug?: string, scope?: AnomalyRoleScope) =>
    scope !== undefined
      ? ([...anomalyKeys.all, 'detail', slug, scope] as const)
      : ([...anomalyKeys.all, 'detail', slug] as const)
};
