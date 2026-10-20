import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { getPlantList } from '../../../services/plants.service';
import type { SortDirection } from '../../../services/listQuery';
import type { PlantsSortField } from '../../../services/plantListQuery';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import { plantKeys } from '../../../shared/reactQuery/plantKeys';
import { usePlantRoleScope } from '../../../shared/reactQuery/usePlantRoleScope';
import {
  PLANT_LIST_URL_PARAMS,
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

export function usePlants() {
  const scope = usePlantRoleScope();
  const [params, setParams] = useSearchParams();
  const request = parsePlantListSearchParams(params);

  const query = useQuery<PaginatedResponse<PlantListItem>>({
    queryKey: plantKeys.list(request, scope),
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
    hasActiveFilters: Object.keys(request.filters).length > 0,
    setPage,
    goToFirstPage,
    clearFilters,
    removeFilter,
    setLimit,
    setSort
  };
}
