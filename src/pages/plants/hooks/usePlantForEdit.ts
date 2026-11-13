import { skipToken, useQuery } from '@tanstack/react-query';
import { getPlantForEdit } from '../../../services/plants.service';
import { catalogEditKeys } from '../../../shared/reactQuery/catalogMutationKeys';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';

export function usePlantForEdit(id?: string, enabled = true) {
  return useQuery({
    queryKey: catalogEditKeys.plantEdit(id ?? ''),
    queryFn: id ? () => getPlantForEdit(id) : skipToken,
    enabled: Boolean(id) && enabled,
    ...QUERY_DEFAULTS
  });
}
