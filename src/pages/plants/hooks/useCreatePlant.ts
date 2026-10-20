import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPlant } from '../../../services/plants.service';
import { invalidatePlantQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { CreatePlantRequest } from '../../../types/Plants/Plant';

export function useCreatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePlantRequest) => createPlant(request),
    onSuccess: async (result) => {
      await invalidatePlantQueries(queryClient, result.plant.id);
    }
  });
}
