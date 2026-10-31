import { useQuery } from '@tanstack/react-query';
import { checkPlantLike } from '../../../services/plantLikes.service';
import { plantKeys } from '../../../shared/reactQuery/plantKeys';

export function usePlantLike(plantId: string, userId?: string) {
  return useQuery({
    queryKey: plantKeys.likeState(plantId, userId),
    queryFn: () => checkPlantLike(plantId),
    enabled: userId !== undefined
  });
}
