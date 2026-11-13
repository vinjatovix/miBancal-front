import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { usePlant } from '../../../../src/pages/plants/hooks/usePlant';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { plantKeys } from '../../../../src/shared/reactQuery/plantKeys';
import { getPlantById } from '../../../../src/services/plants.service';
import { ADMIN_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { listPlantsResponse } from '../../../fixtures/plants/listPlants';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/plants.service', () => ({
  getPlantById: vi.fn()
}));

const mockedGetPlantById = vi.mocked(getPlantById);

describe('usePlant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    clearStoredToken();
  });

  it('exposes loading state initially while fetching', () => {
    mockedGetPlantById.mockImplementation(() => new Promise(() => {}));
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlant('plant-1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('loads plant detail successfully', async () => {
    const mockPlant = listPlantsResponse.data[0];
    mockedGetPlantById.mockResolvedValue(mockPlant);
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlant(mockPlant.id), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockPlant);
    });
  });

  it('exposes error state when fetch fails', async () => {
    mockedGetPlantById.mockRejectedValue(new Error('Network error'));
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlant('plant-err'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('registers the query under the public scope when unauthenticated', async () => {
    const mockPlant = listPlantsResponse.data[0];
    mockedGetPlantById.mockResolvedValue(mockPlant);
    const queryClient = createTestQueryClient();

    renderHook(() => usePlant(mockPlant.id), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      )
    });

    await waitFor(() => {
      const entry = queryClient.getQueryCache().find({
        queryKey: plantKeys.detail(mockPlant.id, 'public')
      });
      expect(entry).toBeDefined();
    });
  });

  it('registers the query under the admin scope when authenticated as admin', async () => {
    setStoredToken(ADMIN_TEST_TOKEN);
    const mockPlant = listPlantsResponse.data[0];
    mockedGetPlantById.mockResolvedValue(mockPlant);
    const queryClient = createTestQueryClient();

    renderHook(() => usePlant(mockPlant.id), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      )
    });

    await waitFor(() => {
      const entry = queryClient.getQueryCache().find({
        queryKey: plantKeys.detail(mockPlant.id, 'admin')
      });
      expect(entry).toBeDefined();
    });
  });

  it('does not request a plant without id', () => {
    const queryClient = createTestQueryClient();

    const { result } = renderHook(() => usePlant(undefined), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedGetPlantById).not.toHaveBeenCalled();
  });

  it('treats a 400 as not found through the query meta', async () => {
    const mockPlant = listPlantsResponse.data[0];
    mockedGetPlantById.mockResolvedValue(mockPlant);
    const queryClient = createTestQueryClient();

    renderHook(() => usePlant(mockPlant.id), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    });

    await waitFor(() => {
      const entry = queryClient.getQueryCache().find({
        queryKey: plantKeys.detail(mockPlant.id, 'public')
      });
      expect(entry?.meta).toEqual({ badRequestMeansNotFound: true });
    });
  });
});
