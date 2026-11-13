import { skipToken, useQuery } from '@tanstack/react-query';

import { getAnomalyForEdit } from '../../../services/anomalies.service';
import { catalogEditKeys } from '../../../shared/reactQuery/catalogMutationKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';

export function useAnomalyForEdit(idOrSlug?: string, enabled = true) {
  return useQuery({
    queryKey: catalogEditKeys.anomalyEdit(idOrSlug ?? ''),
    queryFn: idOrSlug ? () => getAnomalyForEdit(idOrSlug) : skipToken,
    enabled: Boolean(idOrSlug) && enabled,
    ...QUERY_DEFAULTS
  });
}
