import { renderHook } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { useDeletePlant } from '../../../../src/pages/plants/hooks/useDeletePlant';
import { deletePlant } from '../../../../src/services/plants.service';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/plants.service', () => ({
  deletePlant: vi.fn()
}));

const mockedDeletePlant = vi.mocked(deletePlant);

describe('useDeletePlant', () => {
  it('calls deletePlant with provided id and etag', async () => {
    mockedDeletePlant.mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => useDeletePlant(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    });

    await result.current.mutateAsync({ id: 'p-1', etag: '"etag-1"' });

    expect(mockedDeletePlant).toHaveBeenCalledWith('p-1', '"etag-1"');
  });

  it('invalidates plant queries on successful mutation', async () => {
    mockedDeletePlant.mockResolvedValue(undefined);
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDeletePlant(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    });

    await result.current.mutateAsync({ id: 'p-1', etag: '"etag-1"' });

    expect(invalidateSpy).toHaveBeenCalled();
  });
});
