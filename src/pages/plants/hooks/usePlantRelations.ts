import { skipToken, useQuery } from '@tanstack/react-query';
import { getPlantRelations } from '../../../services/plantRelations.service';
import { plantRelationKeys } from '../../../shared/reactQuery/plantRelationKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import { DETAIL_QUERY_META } from '../../../shared/reactQuery/queryMeta';

export function usePlantRelations(plantId?: string) {
  return useQuery({
    queryKey: plantRelationKeys.byPlant(plantId ?? ''),
    queryFn: plantId
      ? () =>
          getPlantRelations({
            filters: { appliesToPlantId: plantId },
            pagination: { page: 1, limit: 100 }
          })
      : skipToken,
    meta: DETAIL_QUERY_META,
    ...QUERY_DEFAULTS
  });
}
