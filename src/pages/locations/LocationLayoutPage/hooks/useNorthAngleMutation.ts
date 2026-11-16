import {
  useMutation,
  useQueryClient,
  type UseMutationResult
} from '@tanstack/react-query';

import { t } from '../../../../i18n/core/t';
import {
  updateLocation,
  type LocationWithMeta
} from '../../../../services/locations.service';
import { ApiError } from '../../../../shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../shared/errors/PreconditionFailedError';
import { locationKeys } from '../../../../shared/reactQuery/locationKeys';
import { useToast } from '../../../../shared/toast/useToast';

export interface UseNorthAngleMutationParams {
  readonly locationId: string;
  readonly etag: string;
}

export function useNorthAngleMutation({
  locationId,
  etag
}: UseNorthAngleMutationParams): UseMutationResult<
  LocationWithMeta,
  unknown,
  number
> {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  return useMutation({
    mutationFn: (newNorthAngle: number) =>
      updateLocation(locationId, { northAngle: newNorthAngle }, etag),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: locationKeys.layout(locationId)
      });
      showSuccessToast(t('location.layout.north_angle_saved'));
    },
    onError: async (error: unknown) => {
      const isPreconditionFailed =
        error instanceof PreconditionFailedError ||
        (error instanceof ApiError && error.status === 412);

      if (isPreconditionFailed) {
        await queryClient.invalidateQueries({
          queryKey: locationKeys.layout(locationId)
        });
      }
      showErrorToast(error, t('location.layout.north_angle_save_error'));
    }
  });
}
