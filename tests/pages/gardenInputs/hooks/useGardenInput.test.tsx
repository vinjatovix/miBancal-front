import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useGardenInput } from '../../../../src/pages/gardenInputs/hooks/useGardenInput';
import { getGardenInput } from '../../../../src/services/gardenInputs.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { getDetailViewState } from '../../../../src/shared/reactQuery/detailViewState';
import { gardenInputKeys } from '../../../../src/shared/reactQuery/gardenInputKeys';
import { COLLABORATOR_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildGardenInput } from '../../../fixtures/gardenInputs/gardenInputFixtures';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/gardenInputs.service', () => ({
  getGardenInput: vi.fn()
}));

const mockedGetGardenInput = vi.mocked(getGardenInput);

function renderUseGardenInput(slug?: string) {
  const queryClient = createTestQueryClient();
  const rendered = renderHook(() => useGardenInput(slug), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  });
  return { queryClient, ...rendered };
}

describe('useGardenInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    clearStoredToken();
  });

  it('loads garden input details by slug', async () => {
    const gardenInput = buildGardenInput();
    mockedGetGardenInput.mockResolvedValue(gardenInput);

    const { result } = renderUseGardenInput('purin-ortiga');

    await waitFor(() => expect(result.current.data).toEqual(gardenInput));
    expect(mockedGetGardenInput).toHaveBeenCalledWith('purin-ortiga');
  });

  it('skips query when slug is undefined', () => {
    renderUseGardenInput(undefined);

    expect(mockedGetGardenInput).not.toHaveBeenCalled();
  });

  it('classifies 404 response as notFound state', async () => {
    mockedGetGardenInput.mockRejectedValue(new ApiError('Not found', 404));

    const { result } = renderUseGardenInput('inexistente');

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(getDetailViewState('inexistente', result.current)).toBe('notFound');
  });

  it('scopes cache by role scope for editorial users', async () => {
    setStoredToken(COLLABORATOR_TEST_TOKEN);
    const gardenInput = buildGardenInput();
    mockedGetGardenInput.mockResolvedValue(gardenInput);

    const { result, queryClient } = renderUseGardenInput('purin-ortiga');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(
      queryClient.getQueryData(
        gardenInputKeys.detail('purin-ortiga', 'editorial')
      )
    ).toEqual(gardenInput);
  });
});
