import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateGardenInput } from '../../../services/gardenInputs.service';
import { invalidateGardenInputQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { UpdateGardenInputRequest } from '../../../types/GardenInput/GardenInput';

export interface UpdateGardenInputParams {
  readonly idOrSlug: string;
  readonly patch: UpdateGardenInputRequest;
  readonly etag: string;
}

export function useUpdateGardenInput() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idOrSlug, patch, etag }: UpdateGardenInputParams) =>
      updateGardenInput(idOrSlug, patch, etag),
    onSuccess: async (result, { idOrSlug }) => {
      await invalidateGardenInputQueries(queryClient, idOrSlug);
      if (result.gardenInput.slug !== idOrSlug) {
        await invalidateGardenInputQueries(
          queryClient,
          result.gardenInput.slug
        );
      }
    }
  });
}
