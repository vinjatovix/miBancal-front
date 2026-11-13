import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBedMutations } from '../../../../src/pages/beds/hooks/useBedMutations';
import {
  createBed,
  deleteBed,
  updateBed
} from '../../../../src/services/beds.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { bedKeys } from '../../../../src/shared/reactQuery/bedKeys';
import { locationKeys } from '../../../../src/shared/reactQuery/locationKeys';
import type { CreateBedRequest } from '../../../../src/types/Bed/Bed';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildBed } from '../../../fixtures/beds/buildBed';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/beds.service', () => ({
  createBed: vi.fn(),
  updateBed: vi.fn(),
  deleteBed: vi.fn()
}));

const mockedCreateBed = vi.mocked(createBed);
const mockedUpdateBed = vi.mocked(updateBed);
const mockedDeleteBed = vi.mocked(deleteBed);

function renderMutations() {
  const queryClient = createTestQueryClient();
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const rendered = renderHook(() => useBedMutations(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  });
  return { queryClient, invalidateQueriesSpy, ...rendered };
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  setStoredToken(VALID_TEST_TOKEN);
});

describe('useBedMutations - create', () => {
  it('executes createBed and invalidates both bed keys and location layout key on success', async () => {
    const { result, invalidateQueriesSpy } = renderMutations();
    const created = buildBed({ id: 'bed-123', name: 'Bancal Tomates' });
    mockedCreateBed.mockResolvedValue({ bed: created, etag: '"1"' });
    const payload: CreateBedRequest = {
      id: 'bed-123',
      name: 'Bancal Tomates',
      width: 120,
      height: 240,
      depth: 30,
      locationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
    };

    act(() => {
      result.current.create.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.create.isSuccess).toBe(true);
    });
    expect(mockedCreateBed).toHaveBeenCalledWith(payload);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: bedKeys.all(result.current.userId)
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.layout('3fa85f64-5717-4562-b3fc-2c963f66afa6')
    });
  });

  it('propagates error when createBed fails', async () => {
    const { result } = renderMutations();
    const apiError = new ApiError('Bad Request', 400, {
      name: 'name_required'
    });
    mockedCreateBed.mockRejectedValue(apiError);

    act(() => {
      result.current.create.mutate({
        id: 'bed-123',
        name: '',
        width: 120,
        height: 240,
        depth: 30,
        locationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
      });
    });

    await waitFor(() => {
      expect(result.current.create.isError).toBe(true);
    });
    expect(result.current.create.error).toBe(apiError);
  });
});

describe('useBedMutations - update', () => {
  it('executes updateBed and invalidates both bed keys and location layout key on success', async () => {
    const { result, invalidateQueriesSpy } = renderMutations();
    const updated = buildBed({ id: 'bed-123', name: 'Bancal Modificado' });
    mockedUpdateBed.mockResolvedValue({ bed: updated, etag: '"etag-2"' });
    const patch = { name: 'Bancal Modificado' };

    act(() => {
      result.current.update.mutate({
        id: 'bed-123',
        patch,
        etag: '"etag-1"',
        locationId: 'loc-456'
      });
    });

    await waitFor(() => {
      expect(result.current.update.isSuccess).toBe(true);
    });
    expect(mockedUpdateBed).toHaveBeenCalledWith('bed-123', patch, '"etag-1"');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: bedKeys.all(result.current.userId)
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.layout('loc-456')
    });
  });

  it('propagates error when updateBed fails', async () => {
    const { result } = renderMutations();
    const apiError = new ApiError('Conflict', 409);
    mockedUpdateBed.mockRejectedValue(apiError);

    act(() => {
      result.current.update.mutate({
        id: 'bed-123',
        patch: { name: 'Duplicated' },
        etag: '"etag-1"'
      });
    });

    await waitFor(() => {
      expect(result.current.update.isError).toBe(true);
    });
    expect(result.current.update.error).toBe(apiError);
  });
});

describe('useBedMutations - remove', () => {
  it('executes deleteBed and invalidates both bed keys and location layout key on success', async () => {
    const { result, invalidateQueriesSpy } = renderMutations();
    mockedDeleteBed.mockResolvedValue(undefined);

    act(() => {
      result.current.remove.mutate({
        id: 'bed-123',
        etag: '"etag-1"',
        locationId: 'loc-456'
      });
    });

    await waitFor(() => {
      expect(result.current.remove.isSuccess).toBe(true);
    });
    expect(mockedDeleteBed).toHaveBeenCalledWith('bed-123', '"etag-1"');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: bedKeys.all(result.current.userId)
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.layout('loc-456')
    });
  });

  it('propagates error when deleteBed fails', async () => {
    const { result } = renderMutations();
    const apiError = new ApiError('Conflict', 409);
    mockedDeleteBed.mockRejectedValue(apiError);

    act(() => {
      result.current.remove.mutate({
        id: 'bed-123',
        etag: '"etag-1"'
      });
    });

    await waitFor(() => {
      expect(result.current.remove.isError).toBe(true);
    });
    expect(result.current.remove.error).toBe(apiError);
  });
});
