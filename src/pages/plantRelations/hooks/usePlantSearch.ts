import { useEffect, useState } from 'react';
import { skipToken, useQuery } from '@tanstack/react-query';
import { searchPlants } from '../../../services/plants.service';
import type { PaginatedResponse } from '../../../types/api';
import type { PlantListItem } from '../../../types/Plants/Plant';

export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export function usePlantSearch(query: string, enabled = true) {
  const trimmed = query.trim();
  const debouncedQuery = useDebounce(trimmed, 300);
  const isValid = debouncedQuery.length >= 2;

  return useQuery<PaginatedResponse<PlantListItem>>({
    queryKey: ['plants', 'search', debouncedQuery],
    queryFn:
      isValid && enabled ? () => searchPlants(debouncedQuery, 5) : skipToken,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30
  });
}
