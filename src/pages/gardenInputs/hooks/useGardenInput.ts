import { skipToken, useQuery } from '@tanstack/react-query';

import { getGardenInput } from '../../../services/gardenInputs.service';
import { gardenInputKeys } from '../../../shared/reactQuery/gardenInputKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import { DETAIL_QUERY_META } from '../../../shared/reactQuery/queryMeta';
import { useGardenInputRoleScope } from '../../../shared/reactQuery/useGardenInputRoleScope';

export function useGardenInput(slug?: string) {
  const scope = useGardenInputRoleScope();

  return useQuery({
    queryKey: gardenInputKeys.detail(slug, scope),
    queryFn: slug ? () => getGardenInput(slug) : skipToken,
    meta: DETAIL_QUERY_META,
    ...QUERY_DEFAULTS
  });
}
