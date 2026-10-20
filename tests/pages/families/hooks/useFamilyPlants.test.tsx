import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useFamilyPlants } from '../../../../src/pages/families/hooks/useFamilyPlants';
import { getFamilyPlants } from '../../../../src/services/plants.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { plantKeys } from '../../../../src/shared/reactQuery/plantKeys';

import type { PaginatedResponse } from '../../../../src/types/api';
import type { FamilyPlantItem } from '../../../../src/types/Plants/Plant';

import { ADMIN_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { listPlantsResponse } from '../../../fixtures/plants/listPlants';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/plants.service', () => ({
  getFamilyPlants: vi.fn()
}));

const mockedGetFamilyPlants = vi.mocked(getFamilyPlants);

function createWrapper() {
  const queryClient = createTestQueryClient();

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useFamilyPlants', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    clearStoredToken();
  });

  it('loads family plants successfully', async () => {
    mockedGetFamilyPlants.mockResolvedValue(listPlantsResponse);

    const { result } = renderHook(
      () => useFamilyPlants('5a2380c4-1546-4511-a77b-ec9d3ebcb7cf'),
      {
        wrapper: createWrapper()
      }
    );

    await waitFor(() => {
      expect(result.current.data?.data).toEqual(listPlantsResponse.data);
    });

    expect(mockedGetFamilyPlants).toHaveBeenCalledExactlyOnceWith(
      '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf'
    );
  });

  it('returns empty array when API returns no data', async () => {
    mockedGetFamilyPlants.mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 25,
        totalPages: 0,
        totalItems: 0
      }
    });

    const { result } = renderHook(
      () => useFamilyPlants('5a2380c4-1546-4511-a77b-ec9d3ebcb7cf'),
      {
        wrapper: createWrapper()
      }
    );

    await waitFor(() => {
      expect(result.current.data?.data).toEqual([]);
    });
  });

  it('handles error state', async () => {
    const failure = new Error('API error');
    mockedGetFamilyPlants.mockRejectedValue(failure);

    const { result } = renderHook(
      () => useFamilyPlants('5a2380c4-1546-4511-a77b-ec9d3ebcb7cf'),
      {
        wrapper: createWrapper()
      }
    );

    await waitFor(() => {
      expect(result.current.error).toBe(failure);
    });
  });

  it('exposes loading state', () => {
    mockedGetFamilyPlants.mockImplementation(
      () => new Promise<PaginatedResponse<FamilyPlantItem>>(() => {})
    );

    const { result } = renderHook(
      () => useFamilyPlants('5a2380c4-1546-4511-a77b-ec9d3ebcb7cf'),
      {
        wrapper: createWrapper()
      }
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('does not call getFamilyPlants when familyId is undefined', () => {
    renderHook(() => useFamilyPlants(undefined), {
      wrapper: createWrapper()
    });

    expect(mockedGetFamilyPlants).not.toHaveBeenCalled();
  });

  it('returns no data when familyId is undefined', () => {
    const { result } = renderHook(() => useFamilyPlants(undefined), {
      wrapper: createWrapper()
    });

    expect(result.current.data).toBeUndefined();
  });

  it('is not fetching when familyId is undefined', () => {
    const { result } = renderHook(() => useFamilyPlants(undefined), {
      wrapper: createWrapper()
    });

    expect(result.current.isFetching).toBe(false);
  });

  it('exposes the total items count from pagination', async () => {
    mockedGetFamilyPlants.mockResolvedValue({
      data: listPlantsResponse.data,
      pagination: {
        page: 1,
        limit: 25,
        totalPages: 2,
        totalItems: 42
      }
    });

    const { result } = renderHook(
      () => useFamilyPlants('5a2380c4-1546-4511-a77b-ec9d3ebcb7cf'),
      {
        wrapper: createWrapper()
      }
    );

    await waitFor(() => {
      expect(result.current.data?.pagination.totalItems).toBe(42);
    });
  });

  it('registers the query under the public scope when unauthenticated', async () => {
    mockedGetFamilyPlants.mockResolvedValue(listPlantsResponse);
    const queryClient = createTestQueryClient();
    const familyId = '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf';

    renderHook(() => useFamilyPlants(familyId), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      )
    });

    await waitFor(() => {
      const entry = queryClient.getQueryCache().find({
        queryKey: plantKeys.family(familyId, 'public')
      });
      expect(entry).toBeDefined();
    });
  });

  it('registers the query under the admin scope when authenticated as admin', async () => {
    setStoredToken(ADMIN_TEST_TOKEN);
    mockedGetFamilyPlants.mockResolvedValue(listPlantsResponse);
    const queryClient = createTestQueryClient();
    const familyId = '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf';

    renderHook(() => useFamilyPlants(familyId), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      )
    });

    await waitFor(() => {
      const entry = queryClient.getQueryCache().find({
        queryKey: plantKeys.family(familyId, 'admin')
      });
      expect(entry).toBeDefined();
    });
  });
});
