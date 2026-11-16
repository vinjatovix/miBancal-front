import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createBed,
  deleteBed,
  updateBed
} from '../../../services/beds.service';
import { useAuth } from '../../../shared/auth/useAuth';
import { bedKeys } from '../../../shared/reactQuery/bedKeys';
import { locationKeys } from '../../../shared/reactQuery/locationKeys';
import type {
  CreateBedRequest,
  UpdateBedRequest
} from '../../../types/Bed/Bed';

interface UpdateParams {
  readonly id: string;
  readonly patch: UpdateBedRequest;
  readonly etag: string;
  readonly locationId?: string | null;
}

interface DeleteParams {
  readonly id: string;
  readonly etag: string;
  readonly locationId?: string | null;
}

export function useBedMutations() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const invalidateAll = () =>
    queryClient.invalidateQueries({
      queryKey: bedKeys.all(userId)
    });

  const invalidateLayout = (locationId?: string | null) => {
    if (!locationId) return Promise.resolve();
    return queryClient.invalidateQueries({
      queryKey: locationKeys.layout(locationId)
    });
  };

  const create = useMutation({
    mutationFn: (input: CreateBedRequest) => createBed(input),
    onSuccess: async (_result, variables) => {
      await invalidateAll();
      await invalidateLayout(variables.locationId);
    }
  });

  const update = useMutation({
    mutationFn: ({ id, patch, etag }: UpdateParams) =>
      updateBed(id, patch, etag),
    onSuccess: async (_result, { locationId }) => {
      await invalidateAll();
      await invalidateLayout(locationId);
    }
  });

  const remove = useMutation({
    mutationFn: ({ id, etag }: DeleteParams) => deleteBed(id, etag),
    onSuccess: async (_result, { locationId }) => {
      await invalidateAll();
      await invalidateLayout(locationId);
    }
  });

  return { create, update, remove, userId };
}
