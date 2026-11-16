import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import {
  getLocationLayout,
  type LocationLayoutWithMeta
} from '../../../../services/locations.service';
import { locationKeys } from '../../../../shared/reactQuery/locationKeys';

export interface UseLocationLayoutReturn {
  readonly query: UseQueryResult<LocationLayoutWithMeta>;
  readonly etag: string;
}

export function useLocationLayout(id: string): UseLocationLayoutReturn {
  const query = useQuery<LocationLayoutWithMeta>({
    queryKey: locationKeys.layout(id),
    queryFn: () => getLocationLayout(id),
    enabled: Boolean(id)
  });

  return { query, etag: query.data?.etag ?? '' };
}
