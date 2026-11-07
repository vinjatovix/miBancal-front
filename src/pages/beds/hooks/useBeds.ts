import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { getBedList } from '../../../services/beds.service';
import { useAuth } from '../../../shared/auth/useAuth';
import { bedKeys } from '../../../shared/reactQuery/bedKeys';
import type { Bed } from '../../../types/Bed/Bed';

export interface UseBedsReturn {
  readonly query: UseQueryResult<readonly Bed[]>;
  readonly locationIdFilter?: string;
  readonly setLocationFilter: (locationId?: string) => void;
}

export function useBeds(): UseBedsReturn {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [searchParams, setSearchParams] = useSearchParams();

  const locationIdParam = searchParams.get('locationId')?.trim();
  const locationIdFilter = locationIdParam || undefined;

  const query = useQuery<readonly Bed[]>({
    queryKey: bedKeys.list(userId, { locationId: locationIdFilter }),
    queryFn: () =>
      getBedList({ locationId: locationIdFilter, include: 'location' }),
    enabled: Boolean(userId)
  });

  const setLocationFilter = (newLocationId?: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newLocationId && newLocationId.trim()) {
        next.set('locationId', newLocationId.trim());
      } else {
        next.delete('locationId');
      }
      return next;
    });
  };

  return {
    query,
    locationIdFilter,
    setLocationFilter
  };
}
