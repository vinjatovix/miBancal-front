import { useEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';
import type { PlantListRequest } from '../../../services/plantListQuery';

function serializeFilters(filters: PlantListRequest['filters']): string {
  const sortedEntries = Object.entries(filters)
    .filter(([, value]) => value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const serializedVal = Array.isArray(val)
        ? [...val].sort((a, b) => (a === b ? 0 : a < b ? -1 : 1)).join(',')
        : String(val);
      return `${key}:${serializedVal}`;
    });
  return sortedEntries.join(';');
}

function buildCatalogScrollKey(request: PlantListRequest): string {
  return `${request.pagination.page}:${request.pagination.limit}:${request.sort.field}:${request.sort.direction}:${serializeFilters(request.filters)}`;
}

export function useCatalogScrollReset(request: PlantListRequest): void {
  const navigationType = useNavigationType();
  const isFirstRender = useRef(true);
  const currentKey = buildCatalogScrollKey(request);
  const previousKey = useRef(currentKey);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (navigationType === 'POP') {
      previousKey.current = currentKey;
      return;
    }

    if (previousKey.current !== currentKey) {
      window.scrollTo(0, 0);
      previousKey.current = currentKey;
    }
  }, [currentKey, navigationType]);
}
