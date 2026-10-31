import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePlantRelation } from '../../../services/plantRelations.service';
import { invalidatePlantRelationQueries } from '../../../shared/reactQuery/catalogMutationKeys';

export interface DeletePlantRelationParams {
  readonly id: string;
  readonly etag: string;
  readonly plantId?: string;
}

export function useDeletePlantRelation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, etag }: DeletePlantRelationParams) =>
      deletePlantRelation(id, etag),
    onSuccess: async (_data, variables) => {
      await invalidatePlantRelationQueries(queryClient, variables.plantId);
    }
  });
}
