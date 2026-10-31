import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePlant } from '../../../services/plants.service';
import { invalidatePlantQueries } from '../../../shared/reactQuery/catalogMutationKeys';

interface DeletePlantParams {
  readonly id: string;
  readonly etag: string;
}

export function useDeletePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, etag }: DeletePlantParams) => deletePlant(id, etag),
    onSuccess: async (_, { id }) => {
      await invalidatePlantQueries(queryClient, id);
    }
  });
}
