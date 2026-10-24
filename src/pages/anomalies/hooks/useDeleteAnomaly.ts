import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteAnomaly } from '../../../services/anomalies.service';
import { invalidateAnomalyQueries } from '../../../shared/reactQuery/catalogMutationKeys';

interface DeleteAnomalyParams {
  readonly idOrSlug: string;
  readonly etag: string;
}

export function useDeleteAnomaly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idOrSlug, etag }: DeleteAnomalyParams) =>
      deleteAnomaly(idOrSlug, etag),
    onSuccess: async (_, { idOrSlug }) => {
      await invalidateAnomalyQueries(queryClient, idOrSlug);
    }
  });
}
