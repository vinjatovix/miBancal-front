import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  createLocation,
  deleteLocation,
  updateLocation
} from '../../../../services/locations.service';
import { useAuth } from '../../../../shared/auth/useAuth';
import { locationKeys } from '../../../../shared/reactQuery/locationKeys';
import type {
  CreateLocationRequest,
  UpdateLocationRequest
} from '../../../../types/Location/Location';

interface UpdateParams {
  readonly id: string;
  readonly patch: UpdateLocationRequest;
  readonly etag: string;
}

interface DeleteParams {
  readonly id: string;
  readonly etag: string;
}

export function useLocationMutations() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  function invalidateAll() {
    return queryClient.invalidateQueries({
      queryKey: locationKeys.all(userId)
    });
  }

  const create = useMutation({
    mutationFn: (input: CreateLocationRequest) => createLocation(input),
    onSuccess: async () => {
      await invalidateAll();
    }
  });

  const update = useMutation({
    mutationFn: ({ id, patch, etag }: UpdateParams) =>
      updateLocation(id, patch, etag),
    onSuccess: async (_result, { id }) => {
      await invalidateAll();
      await queryClient.invalidateQueries({
        queryKey: locationKeys.detail(userId, id)
      });
    }
  });

  const remove = useMutation({
    mutationFn: ({ id, etag }: DeleteParams) => deleteLocation(id, etag),
    onSuccess: async () => {
      await invalidateAll();
    }
  });

  return { create, update, remove, userId };
}
