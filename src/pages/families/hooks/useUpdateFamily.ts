import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateFamily } from '../../../services/families.service';
import { invalidateFamilyQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { UpdateFamilyRequest } from '../../../types/Family';

interface UpdateFamilyParams {
  readonly idOrSlug: string;
  readonly patch: UpdateFamilyRequest;
  readonly etag: string;
}

export function useUpdateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idOrSlug, patch, etag }: UpdateFamilyParams) =>
      updateFamily(idOrSlug, patch, etag),
    onSuccess: async (_, { idOrSlug }) => {
      await invalidateFamilyQueries(queryClient, idOrSlug);
    }
  });
}
