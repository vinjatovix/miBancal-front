import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { getLocationList } from '../../../../services/locations.service';
import type {
  LocationListRequest,
  LocationSortField
} from '../../../../services/locationListQuery';
import type { SortDirection } from '../../../../services/listQuery';
import { useAuth } from '../../../../shared/auth/useAuth';
import { locationKeys } from '../../../../shared/reactQuery/locationKeys';
import { LOCATION_QUERY_DEFAULTS } from '../../../../shared/reactQuery/queryDefaults';
import type { PaginatedResponse } from '../../../../types/api';
import type { Location } from '../../../../types/Location/Location';
import { parseLocationListSearchParams } from '../utils/parseLocationListSearchParams';
import {
  withLocationListLimit,
  withLocationListPage,
  withLocationListSort
} from '../utils/locationListParamWrites';

export function useLocations() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [params, setParams] = useSearchParams();
  const request: LocationListRequest = parseLocationListSearchParams(params);

  const query = useQuery<PaginatedResponse<Location>>({
    queryKey: locationKeys.list(userId, request),
    queryFn: () => getLocationList(request),
    enabled: userId !== '',
    ...LOCATION_QUERY_DEFAULTS
  });

  function setPage(page: number) {
    setParams((prev) => withLocationListPage(prev, page));
  }

  function setLimit(limit: number) {
    setParams((prev) => withLocationListLimit(prev, limit));
  }

  function setSort(field: LocationSortField, direction: SortDirection) {
    setParams((prev) => withLocationListSort(prev, field, direction));
  }

  return { query, request, userId, setPage, setLimit, setSort };
}
