import { skipToken, useQuery } from '@tanstack/react-query';

import { getAnomalyBySlug } from '../../../services/anomalies.service';
import { anomalyKeys } from '../../../shared/reactQuery/anomalyKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import { DETAIL_QUERY_META } from '../../../shared/reactQuery/queryMeta';
import { useAnomalyRoleScope } from '../../../shared/reactQuery/useAnomalyRoleScope';

export function useAnomaly(slug?: string) {
  const scope = useAnomalyRoleScope();

  return useQuery({
    queryKey: anomalyKeys.detail(slug, scope),
    queryFn: slug ? () => getAnomalyBySlug(slug) : skipToken,
    meta: DETAIL_QUERY_META,
    ...QUERY_DEFAULTS
  });
}
