import { useQuery } from '@tanstack/react-query';
import { getFamilyList } from '../../services/families.service';
import { familyKeys } from '../reactQuery/familyKeys';
import { QUERY_DEFAULTS } from '../reactQuery/queryDefaults';

export function useFamilies() {
  return useQuery({
    queryKey: familyKeys.list(),
    queryFn: getFamilyList,
    ...QUERY_DEFAULTS
  });
}
