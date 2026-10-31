import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUpdateGardenInput } from '../../../../src/pages/gardenInputs/hooks/useUpdateGardenInput';
import { updateGardenInput } from '../../../../src/services/gardenInputs.service';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../src/shared/errors/PreconditionFailedError';
import { buildGardenInput } from '../../../fixtures/gardenInputs/gardenInputFixtures';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/gardenInputs.service', () => ({
  updateGardenInput: vi.fn()
}));

const mockedUpdateGardenInput = vi.mocked(updateGardenInput);

const params = {
  idOrSlug: 'purin-ortiga',
  patch: { name: 'Purín enriquecido' },
  etag: '"v1"'
};

function renderUseUpdateGardenInput() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const rendered = renderHook(() => useUpdateGardenInput(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  });
  return { invalidate, ...rendered };
}

describe('useUpdateGardenInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('executes patch mutation with ETag and invalidates domain queries', async () => {
    mockedUpdateGardenInput.mockResolvedValue({
      gardenInput: buildGardenInput({ name: 'Purín enriquecido' }),
      etag: '"v2"'
    });
    const { result, invalidate } = renderUseUpdateGardenInput();

    await result.current.mutateAsync(params);

    expect(mockedUpdateGardenInput).toHaveBeenCalledWith(
      'purin-ortiga',
      { name: 'Purín enriquecido' },
      '"v1"'
    );
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['gardenInputs'] })
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['gardenInputs', 'edit', 'purin-ortiga']
    });
  });

  it('propagates PreconditionFailedError on 412 without invalidating queries', async () => {
    mockedUpdateGardenInput.mockRejectedValue(new PreconditionFailedError());
    const { result, invalidate } = renderUseUpdateGardenInput();

    await expect(result.current.mutateAsync(params)).rejects.toBeInstanceOf(
      PreconditionFailedError
    );
    expect(mockedUpdateGardenInput).toHaveBeenCalledOnce();
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('propagates other API errors', async () => {
    mockedUpdateGardenInput.mockRejectedValue(new ApiError('Bad request', 400));
    const { result } = renderUseUpdateGardenInput();

    await expect(result.current.mutateAsync(params)).rejects.toMatchObject({
      status: 400
    });
  });
});
