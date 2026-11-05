import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createGardenInput } from '../../../services/gardenInputs.service';
import { invalidateGardenInputQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { CreateGardenInputRequest } from '../../../types/GardenInput/GardenInput';

export function useCreateGardenInput() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateGardenInputRequest) =>
      createGardenInput(request),
    onSuccess: async (result) => {
      await invalidateGardenInputQueries(queryClient, result.gardenInput.slug);
    }
  });
}
