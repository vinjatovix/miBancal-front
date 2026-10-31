import { skipToken, useQuery } from '@tanstack/react-query';
import { getPlantById } from '../../../services/plants.service';
import { plantKeys } from '../../../shared/reactQuery/plantKeys';
import { usePlantRoleScope } from '../../../shared/reactQuery/usePlantRoleScope';
import { QUERY_DEFAULTS } from '../../../shared/reactQuery/queryDefaults';
import { DETAIL_QUERY_META } from '../../../shared/reactQuery/queryMeta';

export function usePlant(id?: string) {
  const scope = usePlantRoleScope();

  return useQuery({
    queryKey: plantKeys.detail(id, scope),
    queryFn: id ? () => getPlantById(id) : skipToken,
    meta: DETAIL_QUERY_META,
    ...QUERY_DEFAULTS
  });
}
