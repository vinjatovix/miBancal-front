import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { getPlantInstancesByBed } from '../../../../services/plantInstances.service';
import { getPlantById } from '../../../../services/plants.service';
import { useAuth } from '../../../../shared/auth/useAuth';
import { plantInstanceKeys } from '../../../../shared/reactQuery/plantInstanceKeys';
import { plantKeys } from '../../../../shared/reactQuery/plantKeys';
import {
  LOCATION_QUERY_DEFAULTS,
  QUERY_DEFAULTS
} from '../../../../shared/reactQuery/queryDefaults';
import { resolveCrop } from '../../../../components/beds/visualizer/utils/resolveCrop';
import type { CropPlacementItem } from '../../../../types/PlantInstance/plantPlacementTypes';

export interface LocationBedCropsResult {
  readonly cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>;
  readonly isLoading: boolean;
}

export function useLocationBedCrops(
  bedIds: readonly string[]
): LocationBedCropsResult {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const instanceQueries = useQueries({
    queries: bedIds.map((bedId) => ({
      queryKey: plantInstanceKeys.byBed(userId, bedId),
      queryFn: () => getPlantInstancesByBed(bedId, { page: 1, limit: 100 }),
      enabled: Boolean(userId && bedId),
      ...LOCATION_QUERY_DEFAULTS
    }))
  });

  const plantIds = useMemo(() => {
    const ids = new Set<string>();
    for (const query of instanceQueries) {
      for (const instance of query.data?.data ?? []) {
        if (instance.instanceStatus === 'active') ids.add(instance.plantId);
      }
    }
    return [...ids];
  }, [instanceQueries]);

  const plantQueries = useQueries({
    queries: plantIds.map((plantId) => ({
      queryKey: plantKeys.detail(plantId),
      queryFn: () => getPlantById(plantId),
      enabled: Boolean(plantId),
      ...QUERY_DEFAULTS
    }))
  });

  const cropsByBed = useMemo(() => {
    const plantsById = new Map(
      plantIds.map((plantId, index) => [plantId, plantQueries[index]?.data])
    );
    const map = new Map<string, readonly CropPlacementItem[]>();
    bedIds.forEach((bedId, index) => {
      const result = instanceQueries[index];
      const etag = result?.data?.etag;
      const crops = (result?.data?.data ?? [])
        .filter((instance) => instance.instanceStatus === 'active')
        .map((instance) =>
          resolveCrop(instance, plantsById.get(instance.plantId), etag)
        );
      map.set(bedId, crops);
    });
    return map;
  }, [bedIds, instanceQueries, plantIds, plantQueries]);

  const isLoading =
    instanceQueries.some((query) => query.isLoading) ||
    plantQueries.some((query) => query.isLoading);

  return { cropsByBed, isLoading };
}
