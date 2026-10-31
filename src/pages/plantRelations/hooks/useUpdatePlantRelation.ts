import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlantRelation } from '../../../services/plantRelations.service';
import { invalidatePlantRelationQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { UpdatePlantRelationInput } from '../../../types/Plants/PlantRelation';

export interface UpdatePlantRelationParams {
  readonly id: string;
  readonly patch: UpdatePlantRelationInput;
  readonly etag: string;
}

export function useUpdatePlantRelation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch, etag }: UpdatePlantRelationParams) =>
      updatePlantRelation(id, patch, etag),
    onSuccess: async (result) => {
      await invalidatePlantRelationQueries(
        queryClient,
        result.relation.sourcePlantId
      );
    }
  });
}
