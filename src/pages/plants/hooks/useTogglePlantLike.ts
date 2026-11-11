import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likePlant, unlikePlant } from '../../../services/plantLikes.service';
import { plantKeys } from '../../../shared/reactQuery/plantKeys';
import { usePlantRoleScope } from '../../../shared/reactQuery/usePlantRoleScope';
import { reportRejection } from '../../../shared/observability/reportRejection';
import type { Plant } from '../../../types/Plants/Plant';

export function useTogglePlantLike(plantId: string, userId?: string) {
  const queryClient = useQueryClient();
  const scope = usePlantRoleScope();

  const likeMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await likePlant(plantId);
    },
    onMutate: async () => {
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
        liked: true
      });

      if (previousPlant) {
        queryClient.setQueryData(plantKeys.detail(plantId, scope), {
          ...previousPlant,
          likesCount: previousPlant.likesCount + 1
        });
      }

      return { previousLikeState, previousPlant };
    },
    onError: (_err, _variables, context) => {
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
      queryClient
        .invalidateQueries({ queryKey: plantKeys.all })
        .catch(reportRejection('plant-like'));
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await unlikePlant(plantId);
    },
    onMutate: async () => {
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
        liked: false
      });

      if (previousPlant) {
        queryClient.setQueryData(plantKeys.detail(plantId, scope), {
          ...previousPlant,
          likesCount: Math.max(0, previousPlant.likesCount - 1)
        });
      }

      return { previousLikeState, previousPlant };
    },
    onError: (_err, _variables, context) => {
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
      queryClient
        .invalidateQueries({ queryKey: plantKeys.all })
        .catch(reportRejection('plant-unlike'));
    }
  });

  return {
    like: likeMutation.mutate,
    unlike: unlikeMutation.mutate,
    isPending: likeMutation.isPending || unlikeMutation.isPending
  };
}
