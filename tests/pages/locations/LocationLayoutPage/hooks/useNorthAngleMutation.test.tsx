import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNorthAngleMutation } from '../../../../../src/pages/locations/LocationLayoutPage/hooks/useNorthAngleMutation';
import { updateLocation } from '../../../../../src/services/locations.service';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';
import { locationKeys } from '../../../../../src/shared/reactQuery/locationKeys';
import { ToastProvider } from '../../../../../src/shared/toast/ToastContext';
import { toastStore } from '../../../../../src/shared/toast/toastStore';
import { buildLocation } from '../../../../fixtures/locations/buildLocation';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/locations.service', () => ({
  updateLocation: vi.fn()
}));

const mockedUpdateLocation = vi.mocked(updateLocation);

describe('useNorthAngleMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toastStore.clearToasts();
  });

  it('updates north angle with ETag, invalidates layout query, and displays success toast', async () => {
    const updated = buildLocation({ id: 'loc-1', northAngle: 45 });
    mockedUpdateLocation.mockResolvedValueOnce({
      location: updated,
      etag: '"2"'
    });
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useNorthAngleMutation({ locationId: 'loc-1', etag: '"1"' }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            <ToastProvider>{children}</ToastProvider>
          </QueryClientProvider>
        )
      }
    );

    result.current.mutate(45);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockedUpdateLocation).toHaveBeenCalledWith(
      'loc-1',
      { northAngle: 45 },
      '"1"'
    );
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.layout('loc-1')
    });
    const toasts = toastStore.getSnapshot();
    expect(toasts).toHaveLength(1);
    expect(toasts[0]).toMatchObject({
      variant: 'success',
      message: 'Orientación Norte de la localización guardada correctamente'
    });
  });

  it('handles 412 PreconditionFailedError by invalidating layout query and showing error toast', async () => {
    mockedUpdateLocation.mockRejectedValueOnce(
      new PreconditionFailedError('Stale ETag')
    );
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useNorthAngleMutation({ locationId: 'loc-1', etag: '"1"' }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            <ToastProvider>{children}</ToastProvider>
          </QueryClientProvider>
        )
      }
    );

    result.current.mutate(90);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.layout('loc-1')
    });
    const toasts = toastStore.getSnapshot();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].variant).toBe('error');
  });
});
