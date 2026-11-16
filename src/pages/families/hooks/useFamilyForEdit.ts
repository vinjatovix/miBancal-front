import { skipToken, useQuery } from '@tanstack/react-query';
import { getFamilyForEdit } from '../../../services/families.service';
import { catalogEditKeys } from '../../../shared/reactQuery/catalogMutationKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';

export function useFamilyForEdit(idOrSlug?: string, enabled = true) {
  return useQuery({
    queryKey: catalogEditKeys.familyEdit(idOrSlug ?? ''),
    queryFn: idOrSlug ? () => getFamilyForEdit(idOrSlug) : skipToken,
    enabled: Boolean(idOrSlug) && enabled,
    ...QUERY_DEFAULTS
  });
}
