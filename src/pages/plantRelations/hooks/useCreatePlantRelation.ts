import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPlantRelation } from '../../../services/plantRelations.service';
import { invalidatePlantRelationQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { CreatePlantRelationInput } from '../../../types/Plants/PlantRelation';

export function useCreatePlantRelation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlantRelationInput) =>
      createPlantRelation(payload),
    onSuccess: async (result) => {
      await invalidatePlantRelationQueries(
        queryClient,
        result.relation.sourcePlantId
      );
    }
  });
}
