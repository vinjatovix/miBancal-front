import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createAnomaly } from '../../../services/anomalies.service';
import { invalidateAnomalyQueries } from '../../../shared/reactQuery/catalogMutationKeys';
import type { CreateAnomalyRequest } from '../../../types/Anomaly/Anomaly';

export function useCreateAnomaly() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAnomalyRequest) => createAnomaly(request),
    onSuccess: async (result) => {
      await invalidateAnomalyQueries(queryClient, result.anomaly.slug);
    }
  });
}
