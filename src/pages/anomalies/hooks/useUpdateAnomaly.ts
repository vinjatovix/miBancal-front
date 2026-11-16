import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateAnomaly } from '../../../services/anomalies.service';
import { invalidateAnomalyQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { UpdateAnomalyRequest } from '../../../types/Anomaly/Anomaly';

interface UpdateAnomalyParams {
  readonly idOrSlug: string;
  readonly patch: UpdateAnomalyRequest;
  readonly etag: string;
}

export function useUpdateAnomaly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ idOrSlug, patch, etag }: UpdateAnomalyParams) =>
      updateAnomaly(idOrSlug, patch, etag),
    onSuccess: async (_, { idOrSlug }) => {
      await invalidateAnomalyQueries(queryClient, idOrSlug);
    }
  });
}
