import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFamily } from '../../../services/families.service';
import { invalidateFamilyQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { CreateFamilyRequest } from '../../../types/Family';

export function useCreateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateFamilyRequest) => createFamily(request),
    onSuccess: async (result) => {
      await invalidateFamilyQueries(
        queryClient,
        result.family.slug || result.family.id
      );
    }
  });
}
