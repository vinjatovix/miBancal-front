import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocationMutations } from '../../../../../src/pages/settings/locations/hooks/useLocationMutations';
import {
  createLocation,
  deleteLocation,
  updateLocation
} from '../../../../../src/services/locations.service';
import { AuthProvider } from '../../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../../src/shared/auth/session';
import { ApiError } from '../../../../../src/shared/errors/ApiError';
import { PreconditionFailedError } from '../../../../../src/shared/errors/PreconditionFailedError';
import { locationKeys } from '../../../../../src/shared/reactQuery/locationKeys';
import type { CreateLocationRequest } from '../../../../../src/types/Location/Location';
import { VALID_TEST_TOKEN } from '../../../../fixtures/auth/authFixtures';
import { buildLocation } from '../../../../fixtures/locations/buildLocation';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/locations.service', () => ({
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn()
}));

const mockedCreateLocation = vi.mocked(createLocation);
const mockedUpdateLocation = vi.mocked(updateLocation);
const mockedDeleteLocation = vi.mocked(deleteLocation);

function renderMutations() {
  const queryClient = createTestQueryClient();
  const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const rendered = renderHook(() => useLocationMutations(), {
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

describe('useLocationMutations - create', () => {
  it('ejecuta createLocation e invalida las keys del usuario al tener éxito', async () => {
    const { result, invalidateQueriesSpy } = renderMutations();
    const created = buildLocation({ id: 'loc-new', name: 'Nuevo Huerto' });
    mockedCreateLocation.mockResolvedValue({ location: created, etag: '"1"' });
    const payload: CreateLocationRequest = {
      id: 'loc-new',
      name: 'Nuevo Huerto',
      latitude: 40.4168,
      longitude: -3.7038
    };

    act(() => {
      result.current.create.mutate(payload);
    });

    await waitFor(() => {
      expect(result.current.create.isSuccess).toBe(true);
    });
    expect(mockedCreateLocation).toHaveBeenCalledWith(payload);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.all(result.current.userId)
    });
  });

  it('propaga el error cuando la creación falla', async () => {
    const { result } = renderMutations();
    const apiError = new ApiError('Bad Request', 400, {
      name: 'name_required'
    });
    mockedCreateLocation.mockRejectedValue(apiError);

    act(() => {
      result.current.create.mutate({
        id: 'id-1',
        name: '',
        latitude: 40.4168,
        longitude: -3.7038
      });
    });

    await waitFor(() => {
      expect(result.current.create.isError).toBe(true);
    });
    expect(result.current.create.error).toBe(apiError);
  });
});

describe('useLocationMutations - update', () => {
  it('ejecuta updateLocation e invalida all y detail del usuario', async () => {
    const { result, invalidateQueriesSpy } = renderMutations();
    const updated = buildLocation({ id: 'loc-1', name: 'Actualizado' });
    mockedUpdateLocation.mockResolvedValue({ location: updated, etag: '"2"' });

    act(() => {
      result.current.update.mutate({
        id: 'loc-1',
        patch: { name: 'Actualizado' },
        etag: '"1"'
      });
    });

    await waitFor(() => {
      expect(result.current.update.isSuccess).toBe(true);
    });
    expect(mockedUpdateLocation).toHaveBeenCalledWith(
      'loc-1',
      { name: 'Actualizado' },
      '"1"'
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.all(result.current.userId)
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.detail(result.current.userId, 'loc-1')
    });
  });

  it('propaga PreconditionFailedError ante un conflicto 412', async () => {
    const { result } = renderMutations();
    const preconditionError = new PreconditionFailedError('Stale ETag');
    mockedUpdateLocation.mockRejectedValue(preconditionError);

    act(() => {
      result.current.update.mutate({
        id: 'loc-1',
        patch: { name: 'Actualizado' },
        etag: '"1"'
      });
    });

    await waitFor(() => {
      expect(result.current.update.isError).toBe(true);
    });
    expect(result.current.update.error).toBe(preconditionError);
  });
});

describe('useLocationMutations - delete', () => {
  it('ejecuta deleteLocation e invalida las keys del usuario', async () => {
    const { result, invalidateQueriesSpy } = renderMutations();
    mockedDeleteLocation.mockResolvedValue(undefined);

    act(() => {
      result.current.remove.mutate({ id: 'loc-1', etag: '"1"' });
    });

    await waitFor(() => {
      expect(result.current.remove.isSuccess).toBe(true);
    });
    expect(mockedDeleteLocation).toHaveBeenCalledWith('loc-1', '"1"');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: locationKeys.all(result.current.userId)
    });
  });

  it('propaga PreconditionFailedError ante un conflicto 412 en delete', async () => {
    const { result } = renderMutations();
    const preconditionError = new PreconditionFailedError('Stale ETag');
    mockedDeleteLocation.mockRejectedValue(preconditionError);

    act(() => {
      result.current.remove.mutate({ id: 'loc-1', etag: '"1"' });
    });

    await waitFor(() => {
      expect(result.current.remove.isError).toBe(true);
    });
    expect(result.current.remove.error).toBe(preconditionError);
  });
});
