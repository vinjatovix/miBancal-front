import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getPlantInstancesByBed } from '../../../services/plantInstances.service';
import { useAuth } from '../../../shared/auth/useAuth';
import { plantInstanceKeys } from '../../../shared/reactQuery/plantInstanceKeys';
import { LOCATION_QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import { resolveCrop } from '../../../components/beds/visualizer/utils/resolveCrop';
import type { CropPlacementItem } from '../../../types/PlantInstance/plantPlacementTypes';
import { usePlantCatalog } from './usePlantCatalog';

export interface BedPlantInstancesResult {
  readonly crops: readonly CropPlacementItem[];
  readonly isLoading: boolean;
  readonly isError: boolean;
}

export function useBedPlantInstances(bedId: string): BedPlantInstancesResult {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const instancesQuery = useQuery({
    queryKey: plantInstanceKeys.byBed(userId, bedId),
    queryFn: () => getPlantInstancesByBed(bedId, { page: 1, limit: 100 }),
    enabled: Boolean(userId && bedId),
    ...LOCATION_QUERY_DEFAULTS
  });

  const catalogQuery = usePlantCatalog('');

  const crops = useMemo(() => {
    const instances = instancesQuery.data?.data ?? [];
    const etag = instancesQuery.data?.etag;
    const plantsById = new Map(
      (catalogQuery.data?.data ?? []).map((plant) => [plant.id, plant])
    );
    return instances
      .filter((instance) => instance.instanceStatus === 'active')
      .map((instance) =>
        resolveCrop(instance, plantsById.get(instance.plantId), etag)
      );
  }, [instancesQuery.data, catalogQuery.data]);

  return {
    crops,
    isLoading: instancesQuery.isLoading,
    isError: instancesQuery.isError
  };
}
