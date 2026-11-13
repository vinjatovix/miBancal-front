import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useDeleteGardenInput } from '../../../../src/pages/gardenInputs/hooks/useDeleteGardenInput';
import { deleteGardenInput } from '../../../../src/services/gardenInputs.service';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../src/shared/errors/PreconditionFailedError';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/gardenInputs.service', () => ({
  deleteGardenInput: vi.fn()
}));

const mockedDeleteGardenInput = vi.mocked(deleteGardenInput);

const params = {
  idOrSlug: 'purin-ortiga',
  etag: '"v1"'
};

function renderUseDeleteGardenInput() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const rendered = renderHook(() => useDeleteGardenInput(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  });
  return { invalidate, ...rendered };
}

describe('useDeleteGardenInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes delete with If-Match etag and invalidates garden input queries', async () => {
    mockedDeleteGardenInput.mockResolvedValue(undefined);
    const { result, invalidate } = renderUseDeleteGardenInput();

    await result.current.mutateAsync(params);

    expect(mockedDeleteGardenInput).toHaveBeenCalledWith(
      'purin-ortiga',
      '"v1"'
    );
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['gardenInputs'] })
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['gardenInputs', 'detail', 'purin-ortiga']
    });
  });

  it('propagates PreconditionFailedError on 412 without invalidating queries', async () => {
    mockedDeleteGardenInput.mockRejectedValue(new PreconditionFailedError());
    const { result, invalidate } = renderUseDeleteGardenInput();

    await expect(result.current.mutateAsync(params)).rejects.toBeInstanceOf(
      PreconditionFailedError
    );
    expect(mockedDeleteGardenInput).toHaveBeenCalledOnce();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('propagates API error on other failures', async () => {
    mockedDeleteGardenInput.mockRejectedValue(
      new ApiError('Server error', 500)
    );
    const { result } = renderUseDeleteGardenInput();

    await expect(result.current.mutateAsync(params)).rejects.toMatchObject({
      status: 500
    });
  });
});
