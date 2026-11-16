import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePlant } from '../../../services/plants.service';
import { invalidatePlantQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { UpdatePlantRequest } from '../../../types/Plants/Plant';

interface UpdatePlantParams {
  readonly id: string;
  readonly patch: UpdatePlantRequest;
  readonly etag: string;
}

export function useUpdatePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch, etag }: UpdatePlantParams) =>
      updatePlant(id, patch, etag),
    onSuccess: async (_, { id }) => {
      await invalidatePlantQueries(queryClient, id);
    }
  });
}
