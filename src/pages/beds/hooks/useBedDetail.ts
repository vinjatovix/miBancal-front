import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getBedById } from '../../../services/beds.service';
import { useAuth } from '../../../shared/auth/useAuth';
import { bedKeys } from '../../../shared/reactQuery/bedKeys';
import type { Bed } from '../../../types/Bed/Bed';

export function useBedDetail(id: string): UseQueryResult<Bed> {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery<Bed>({
    queryKey: bedKeys.detail(userId, id),
    queryFn: () => getBedById(id, 'location'),
    enabled: Boolean(userId && id)
  });
}
