import { skipToken, useQuery } from '@tanstack/react-query';
import { getFamilyById } from '../../../services/families.service';
import { familyKeys } from '../../../shared/reactQuery/familyKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import { DETAIL_QUERY_META } from '../../../shared/reactQuery/queryMeta';

export function useFamily(id?: string) {
  return useQuery({
    queryKey: familyKeys.detail(id),
    queryFn: id ? () => getFamilyById(id) : skipToken,
    meta: DETAIL_QUERY_META,
    ...QUERY_DEFAULTS
  });
}
