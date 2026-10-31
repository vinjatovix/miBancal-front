import { skipToken, useQuery } from '@tanstack/react-query';

import { getGardenInputWithMeta } from '../../../services/gardenInputs.service';
import { catalogEditKeys } from '../../../shared/reactQuery/catalogMutationKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';

export function useGardenInputForEdit(idOrSlug?: string, enabled = true) {
  return useQuery({
    queryKey: catalogEditKeys.gardenInputEdit(idOrSlug ?? ''),
    queryFn: idOrSlug ? () => getGardenInputWithMeta(idOrSlug) : skipToken,
    enabled: Boolean(idOrSlug) && enabled,
    ...QUERY_DEFAULTS
  });
}
