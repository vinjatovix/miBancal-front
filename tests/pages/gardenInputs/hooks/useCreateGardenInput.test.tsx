import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCreateGardenInput } from '../../../../src/pages/gardenInputs/hooks/useCreateGardenInput';
import { createGardenInput } from '../../../../src/services/gardenInputs.service';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import type { CreateGardenInputRequest } from '../../../../src/types/GardenInput/GardenInput';
import { buildGardenInput } from '../../../fixtures/gardenInputs/gardenInputFixtures';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/gardenInputs.service', () => ({
  createGardenInput: vi.fn()
}));

const mockedCreateGardenInput = vi.mocked(createGardenInput);

const request: CreateGardenInputRequest = {
  id: '7b8e5c3e-3242-4f35-9f5b-1c5c163b2f90',
  slug: 'purin-ortiga',
  name: 'Purín de ortiga',
  category: 'fertilizer'
};

function renderUseCreateGardenInput() {
  const queryClient = createTestQueryClient();
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const rendered = renderHook(() => useCreateGardenInput(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  });
  return { invalidate, ...rendered };
}

describe('useCreateGardenInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates garden input and invalidates domain queries on success', async () => {
    const created = { gardenInput: buildGardenInput(), etag: '"v1"' };
    mockedCreateGardenInput.mockResolvedValue(created);
    const { result, invalidate } = renderUseCreateGardenInput();

    await result.current.mutateAsync(request);

    expect(mockedCreateGardenInput).toHaveBeenCalledWith(request);
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['gardenInputs'] })
    );
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['gardenInputs', 'detail', 'purin-ortiga']
    });
  });

  it('propagates 409 duplicate slug error without invalidating queries', async () => {
    mockedCreateGardenInput.mockRejectedValue(new ApiError('Duplicate', 409));
    const { result, invalidate } = renderUseCreateGardenInput();

    await expect(result.current.mutateAsync(request)).rejects.toMatchObject({
      status: 409
    });
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('propagates 400 bad request error with field errors', async () => {
    mockedCreateGardenInput.mockRejectedValue(
      new ApiError('Bad request', 400, { name: 'required' })
    );
    const { result } = renderUseCreateGardenInput();

    await expect(result.current.mutateAsync(request)).rejects.toMatchObject({
      status: 400,
      errors: { name: 'required' }
    });
  });
});
