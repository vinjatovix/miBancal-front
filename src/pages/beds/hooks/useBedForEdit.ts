import { useQuery } from '@tanstack/react-query';

import { getBedForEdit } from '../../../services/beds.service';
import { useAuth } from '../../../shared/auth/useAuth';
import { bedKeys } from '../../../shared/reactQuery/bedKeys';

export function useBedForEdit(id: string | null) {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const query = useQuery({
    queryKey: [...bedKeys.detail(userId, id ?? ''), 'edit'],
    queryFn: () =>
      id ? getBedForEdit(id) : Promise.reject(new Error('Missing id')),
    enabled: Boolean(userId && id)
  });

  return {
    bed: query.data?.bed,
    etag: query.data?.etag,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}
