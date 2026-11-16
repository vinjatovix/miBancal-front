import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getPlantList } from '../../../services/plants.service';
import {
  DEFAULT_PLANT_SORT,
  type PlantFilterParams,
  type PlantListRequest
} from '../../../services/plantListQuery';
import { plantKeys } from '../../../shared/reactQuery/plantKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import type { PlantListItem } from '../../../types/Plants/Plant';
import type { PaginatedResponse } from '../../../types/api';

const CATALOG_PAGE_LIMIT = 50;

export interface PlantCatalogOptions {
  readonly onlyFavorites?: boolean;
  readonly enabled?: boolean;
}

function buildCatalogRequest(
  search: string,
  onlyFavorites: boolean
): PlantListRequest {
  const trimmed = search.trim();
  const filters: PlantFilterParams = {};
  if (trimmed) filters.identity = trimmed;
  if (onlyFavorites) filters.bookmarked = 'true';
  return {
    filters,
    pagination: { page: 1, limit: CATALOG_PAGE_LIMIT },
    sort: DEFAULT_PLANT_SORT
  };
}

export function usePlantCatalog(
  search: string,
  options: PlantCatalogOptions = {}
): UseQueryResult<PaginatedResponse<PlantListItem>> {
  const onlyFavorites = options.onlyFavorites ?? false;
  const request = buildCatalogRequest(search, onlyFavorites);

  return useQuery<PaginatedResponse<PlantListItem>>({
    queryKey: plantKeys.list(request, 'public'),
    queryFn: () => getPlantList(request),
    enabled: options.enabled ?? true,
    ...QUERY_DEFAULTS
  });
}
