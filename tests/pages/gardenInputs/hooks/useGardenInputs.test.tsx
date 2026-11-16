import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useGardenInputs } from '../../../../src/pages/gardenInputs/hooks/useGardenInputs';
import { getGardenInputList } from '../../../../src/services/gardenInputs.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { gardenInputKeys } from '../../../../src/shared/reactQuery/gardenInputKeys';
import type { PaginatedResponse } from '../../../../src/types/api';
import type { GardenInputListItem } from '../../../../src/types/GardenInput/GardenInput';
import {
  COLLABORATOR_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../../fixtures/auth/authFixtures';
import { buildGardenInputListItem } from '../../../fixtures/gardenInputs/gardenInputFixtures';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/gardenInputs.service', () => ({
  getGardenInputList: vi.fn()
}));

const mockedGetGardenInputList = vi.mocked(getGardenInputList);

const response: PaginatedResponse<GardenInputListItem> = {
  data: [buildGardenInputListItem()],
  pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 1 }
};

function useGardenInputsWithLocation() {
  return { gardenInputs: useGardenInputs(), search: useLocation().search };
}

function renderUseGardenInputs(route = '/garden-inputs') {
  const queryClient = createTestQueryClient();
  const rendered = renderHook(() => useGardenInputsWithLocation(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path="*" element={children} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    )
  });
  return { queryClient, ...rendered };
}

describe('useGardenInputs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    clearStoredToken();
    mockedGetGardenInputList.mockResolvedValue(response);
  });

  it('maps url search params to garden inputs list request', async () => {
    const { result } = renderUseGardenInputs(
      '/garden-inputs?category=defense,fertilizer&action=fungicide&sortField=slug&sortDirection=desc&page=2&limit=50'
    );

    await waitFor(() =>
      expect(result.current.gardenInputs.query.isSuccess).toBe(true)
    );

    expect(mockedGetGardenInputList).toHaveBeenCalledWith({
      filters: {
        category: ['defense', 'fertilizer'],
        action: ['fungicide']
      },
      pagination: { page: 2, limit: 50 },
      sort: { field: 'slug', direction: 'desc' }
    });
    expect(result.current.gardenInputs.hasActiveFilters).toBe(true);
  });

  it('resets page when sort is updated', async () => {
    const { result } = renderUseGardenInputs('/garden-inputs?page=3');
    await waitFor(() =>
      expect(result.current.gardenInputs.query.isSuccess).toBe(true)
    );

    act(() => result.current.gardenInputs.setSort('slug', 'desc'));

    const params = new URLSearchParams(result.current.search);
    expect(params.get('sortField')).toBe('slug');
    expect(params.get('sortDirection')).toBe('desc');
    expect(params.has('page')).toBe(false);
  });

  it('resets page when limit is updated', async () => {
    const { result } = renderUseGardenInputs('/garden-inputs?page=3');
    await waitFor(() =>
      expect(result.current.gardenInputs.query.isSuccess).toBe(true)
    );

    act(() => result.current.gardenInputs.setLimit(50));

    const params = new URLSearchParams(result.current.search);
    expect(params.get('limit')).toBe('50');
    expect(params.has('page')).toBe(false);
  });

  it('toggles category filter in search params', async () => {
    const { result } = renderUseGardenInputs('/garden-inputs?category=defense');
    await waitFor(() =>
      expect(result.current.gardenInputs.query.isSuccess).toBe(true)
    );

    act(() => result.current.gardenInputs.toggleCategory('fertilizer'));

    const params = new URLSearchParams(result.current.search);
    expect(params.get('category')).toBe('defense,fertilizer');
  });

  it('handles repeated category url parameters when removing one', async () => {
    const { result } = renderUseGardenInputs(
      '/garden-inputs?category=defense&category=fertilizer'
    );
    await waitFor(() =>
      expect(result.current.gardenInputs.query.isSuccess).toBe(true)
    );

    act(() => result.current.gardenInputs.toggleCategory('defense'));

    const params = new URLSearchParams(result.current.search);
    expect(params.get('category')).toBe('fertilizer');
    expect(params.getAll('category')).toEqual(['fertilizer']);
  });

  it('toggles action filter in search params', async () => {
    const { result } = renderUseGardenInputs('/garden-inputs?action=fungicide');
    await waitFor(() =>
      expect(result.current.gardenInputs.query.isSuccess).toBe(true)
    );

    act(() => result.current.gardenInputs.toggleAction('fungicide'));

    const params = new URLSearchParams(result.current.search);
    expect(params.has('action')).toBe(false);
  });

  it('clears all active filters when clearFilters is called', async () => {
    const { result } = renderUseGardenInputs(
      '/garden-inputs?category=defense&action=fungicide&page=2&limit=50'
    );
    await waitFor(() =>
      expect(result.current.gardenInputs.query.isSuccess).toBe(true)
    );

    act(() => result.current.gardenInputs.clearFilters());

    expect(new URLSearchParams(result.current.search).toString()).toBe(
      'limit=50'
    );
  });

  it('uses public scope in queryKey for unauthenticated users', async () => {
    setStoredToken(VALID_TEST_TOKEN);
    const { result, queryClient } = renderUseGardenInputs();
    await waitFor(() =>
      expect(result.current.gardenInputs.query.isSuccess).toBe(true)
    );

    expect(
      queryClient.getQueryData(
        gardenInputKeys.list(result.current.gardenInputs.request, 'public')
      )
    ).toEqual(response);
  });

  it('uses editorial scope in queryKey for collaborator role', async () => {
    setStoredToken(COLLABORATOR_TEST_TOKEN);
    const { result, queryClient } = renderUseGardenInputs();
    await waitFor(() =>
      expect(result.current.gardenInputs.query.isSuccess).toBe(true)
    );

    expect(
      queryClient.getQueryData(
        gardenInputKeys.list(result.current.gardenInputs.request, 'editorial')
      )
    ).toEqual(response);
  });
});
