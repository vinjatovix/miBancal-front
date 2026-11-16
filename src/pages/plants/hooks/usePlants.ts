import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getPlantList } from '../../../services/plants.service';
import type { SortDirection } from '../../../services/listQuery';
import type {
  PlantListRequest,
  PlantsSortField
} from '../../../services/plantListQuery';
import { AuthContext } from '../../../shared/auth/authContextDef';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import {
  plantKeys,
  type PlantRoleScope
} from '../../../shared/reactQuery/plantKeys';
import { usePlantRoleScope } from '../../../shared/reactQuery/usePlantRoleScope';
import {
  PLANT_LIST_URL_PARAMS,
  isFavoritesTab,
  withoutPlantListFilters
} from '../../../shared/constants/plantListUrlParams';
import type { PlantListItem } from '../../../types/Plants/Plant';
import type { PaginatedResponse } from '../../../types/api';
import type { ActiveFilter } from '../utils/buildActiveFilters';
import { parsePlantListSearchParams } from '../utils/parsePlantListSearchParams';
import {
  withListPage,
  withListParam,
  withListSort,
  withoutListPage,
  withoutListParam
} from '../utils/plantListParamWrites';
import { removeMultiValueParam } from '../utils/removeMultiValueParam';

function withBookmarkedFilter(
  request: PlantListRequest,
  favoritesTabActive: boolean
): PlantListRequest {
  if (!favoritesTabActive) return request;
  return {
    ...request,
    filters: { ...request.filters, bookmarked: 'true' }
  };
}

function listQueryKey(
  request: PlantListRequest,
  scope: PlantRoleScope,
  userId?: string
) {
  return request.filters.bookmarked
    ? ([...plantKeys.list(request, scope), userId] as const)
    : plantKeys.list(request, scope);
}

export function usePlants() {
  const scope = usePlantRoleScope();
  const auth = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const favoritesTabActive =
    (auth?.isAuthenticated ?? false) && isFavoritesTab(params);
  const baseRequest = parsePlantListSearchParams(params);
  const request = withBookmarkedFilter(baseRequest, favoritesTabActive);

  const query = useQuery<PaginatedResponse<PlantListItem>>({
    queryKey: listQueryKey(request, scope, auth?.user?.id),
    queryFn: () => getPlantList(request),
    ...QUERY_DEFAULTS
  });

  function updateParams(key: string, value: string) {
    setParams((prev) => withListParam(prev, key, value));
  }

  function setPage(page: number) {
    setParams((prev) => withListPage(prev, page));
  }

  function goToFirstPage() {
    setParams((prev) => withoutListPage(prev));
  }

  function clearFilters() {
    setParams((prev) => withoutPlantListFilters(prev));
  }

  function setLimit(limit: number) {
    updateParams(PLANT_LIST_URL_PARAMS.limit, String(limit));
  }

  function removeFilter(descriptor: ActiveFilter) {
    setParams((prev) =>
      descriptor.value !== undefined
        ? withoutListPage(
            removeMultiValueParam(prev, descriptor.param, descriptor.value)
          )
        : withoutListParam(prev, descriptor.param)
    );
  }

  function setSort(field: PlantsSortField, direction: SortDirection) {
    setParams((prev) => withListSort(prev, field, direction));
  }

  return {
    query,
    request,
    hasActiveFilters: Object.keys(baseRequest.filters).length > 0,
    setPage,
    goToFirstPage,
    clearFilters,
    removeFilter,
    setLimit,
    setSort
  };
}
