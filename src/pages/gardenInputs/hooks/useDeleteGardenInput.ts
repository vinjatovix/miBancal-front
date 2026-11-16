import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteGardenInput } from '../../../services/gardenInputs.service';
import { invalidateGardenInputQueries } from '../../../shared/reactQuery/catalogMutationKeys';

export interface DeleteGardenInputParams {
  readonly idOrSlug: string;
  readonly etag: string;
}

export function useDeleteGardenInput() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idOrSlug, etag }: DeleteGardenInputParams) =>
      deleteGardenInput(idOrSlug, etag),
    onSuccess: async (_, { idOrSlug }) => {
      await invalidateGardenInputQueries(queryClient, idOrSlug);
    }
  });
}
