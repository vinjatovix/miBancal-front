import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { getGardenInputList } from '../../../services/gardenInputs.service';
import type { GardenInputSortField } from '../../../services/gardenInputListQuery';
import type { SortDirection } from '../../../services/listQuery';
import {
  GARDEN_INPUT_LIST_URL_PARAMS,
  withoutGardenInputListFilters
} from '../../../shared/constants/gardenInputListUrlParams';
import { gardenInputKeys } from '../../../shared/reactQuery/gardenInputKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import { useGardenInputRoleScope } from '../../../shared/reactQuery/useGardenInputRoleScope';
import type { PaginatedResponse } from '../../../types/api';
import type {
  GardenInputAction,
  GardenInputCategory,
  GardenInputListItem
} from '../../../types/GardenInput/GardenInput';
import {
  countActiveFilters,
  parseGardenInputListSearchParams,
  withListPage,
  withListParam,
  withListSort,
  withMultiFilterToggle,
  withoutListPage
} from '../utils/gardenInputListParams';

export function useGardenInputs() {
  const scope = useGardenInputRoleScope();
  const [params, setParams] = useSearchParams();
  const request = parseGardenInputListSearchParams(params);

  const query = useQuery<PaginatedResponse<GardenInputListItem>>({
    queryKey: gardenInputKeys.list(request, scope),
    queryFn: () => getGardenInputList(request),
    ...QUERY_DEFAULTS
  });

  function setPage(page: number) {
    setParams((prev) => withListPage(prev, page));
  }

  function goToFirstPage() {
    setParams((prev) => withoutListPage(prev));
  }

  function setLimit(limit: number) {
    setParams((prev) =>
      withListParam(prev, GARDEN_INPUT_LIST_URL_PARAMS.limit, String(limit))
    );
  }

  function setSort(field: GardenInputSortField, direction: SortDirection) {
    setParams((prev) => withListSort(prev, field, direction));
  }

  function toggleCategory(category: GardenInputCategory) {
    setParams((prev) =>
      withMultiFilterToggle(
        prev,
        GARDEN_INPUT_LIST_URL_PARAMS.category,
        category
      )
    );
  }

  function toggleAction(action: GardenInputAction) {
    setParams((prev) =>
      withMultiFilterToggle(prev, GARDEN_INPUT_LIST_URL_PARAMS.action, action)
    );
  }

  function clearFilters() {
    setParams((prev) => withoutGardenInputListFilters(prev));
  }

  return {
    query,
    request,
    hasActiveFilters: countActiveFilters(request) > 0,
    setPage,
    goToFirstPage,
    setLimit,
    setSort,
    toggleCategory,
    toggleAction,
    clearFilters
  };
}
