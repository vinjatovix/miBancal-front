import { useQuery } from '@tanstack/react-query';

import { getLocationForEdit } from '../../../../services/locations.service';
import { useAuth } from '../../../../shared/auth/useAuth';
import { locationKeys } from '../../../../shared/reactQuery/locationKeys';
import { LOCATION_QUERY_DEFAULTS } from '../../../../shared/reactQuery/queryDefaults';

export function useLocationForEdit(id: string | null) {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const query = useQuery({
    queryKey: locationKeys.detail(userId, id ?? undefined),
    queryFn: () =>
      id ? getLocationForEdit(id) : Promise.reject(new Error('Missing id')),
    enabled: Boolean(userId && id),
    ...LOCATION_QUERY_DEFAULTS
  });

  return {
    location: query.data?.location,
    etag: query.data?.etag,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch
  };
}
