import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { getAnomalyList } from '../../../services/anomalies.service';
import type { AnomalySortField } from '../../../services/anomalyListQuery';
import type { SortDirection } from '../../../services/listQuery';
import {
  ANOMALY_LIST_URL_PARAMS,
  withoutAnomalyListFilters
} from '../../../shared/constants/anomalyListUrlParams';
import { anomalyKeys } from '../../../shared/reactQuery/anomalyKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import { useAnomalyRoleScope } from '../../../shared/reactQuery/useAnomalyRoleScope';
import type { AnomalyListItem } from '../../../types/Anomaly/Anomaly';
import type { PaginatedResponse } from '../../../types/api';
import {
  countActiveFilters,
  parseAnomalyListSearchParams,
  withListPage,
  withListParam,
  withListSort,
  withoutListPage
} from '../utils/anomalyListParams';

export function useAnomalies() {
  const scope = useAnomalyRoleScope();
  const [params, setParams] = useSearchParams();
  const request = parseAnomalyListSearchParams(params);

  const query = useQuery<PaginatedResponse<AnomalyListItem>>({
    queryKey: anomalyKeys.list(request, scope),
    queryFn: () => getAnomalyList(request),
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
      withListParam(prev, ANOMALY_LIST_URL_PARAMS.limit, String(limit))
    );
  }

  function setSort(field: AnomalySortField, direction: SortDirection) {
    setParams((prev) => withListSort(prev, field, direction));
  }

  function clearFilters() {
    setParams((prev) => withoutAnomalyListFilters(prev));
  }

  return {
    query,
    request,
    hasActiveFilters: countActiveFilters(request) > 0,
    setPage,
    goToFirstPage,
    setLimit,
    setSort,
    clearFilters
  };
}
