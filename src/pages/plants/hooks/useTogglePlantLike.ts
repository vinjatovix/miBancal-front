import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePlant, unlikePlant } from '../../../services/plantLikes.service';
import { plantKeys } from '../../../shared/reactQuery/plantKeys';
import { usePlantRoleScope } from '../../../shared/reactQuery/usePlantRoleScope';
import type { Plant } from '../../../types/Plants/Plant';

export function useTogglePlantLike(plantId: string, userId?: string) {
  const queryClient = useQueryClient();
  const scope = usePlantRoleScope();

  return useMutation({
    mutationFn: async (liked: boolean): Promise<void> => {
      if (liked) {
        await unlikePlant(plantId);
      } else {
        await likePlant(plantId);
      }
    },
    onMutate: async (liked: boolean) => {
      await queryClient.cancelQueries({
        queryKey: plantKeys.likeState(plantId, userId)
      });
      await queryClient.cancelQueries({
        queryKey: plantKeys.detail(plantId, scope)
      });

      const previousLikeState = queryClient.getQueryData<{ liked: boolean }>(
        plantKeys.likeState(plantId, userId)
      );
      const previousPlant = queryClient.getQueryData<Plant>(
        plantKeys.detail(plantId, scope)
      );

      queryClient.setQueryData(plantKeys.likeState(plantId, userId), {
        liked: !liked
      });

      if (previousPlant) {
        queryClient.setQueryData(plantKeys.detail(plantId, scope), {
          ...previousPlant,
          likesCount: liked
            ? Math.max(0, previousPlant.likesCount - 1)
            : previousPlant.likesCount + 1
        });
      }

      return { previousLikeState, previousPlant };
    },
    onError: (_err, _liked, context) => {
      queryClient.setQueryData(
        plantKeys.likeState(plantId, userId),
        context?.previousLikeState
      );
      queryClient.setQueryData(
        plantKeys.detail(plantId, scope),
        context?.previousPlant
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: plantKeys.all });
    }
  });
}
