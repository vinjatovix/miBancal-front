import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocations } from '../../../../../src/pages/settings/locations/hooks/useLocations';
import { getLocationList } from '../../../../../src/services/locations.service';
import { AuthProvider } from '../../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../../src/shared/auth/session';
import { VALID_TEST_TOKEN } from '../../../../fixtures/auth/authFixtures';
import { listLocationsResponse } from '../../../../fixtures/locations/listLocations';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/locations.service', () => ({
  getLocationList: vi.fn()
}));

const mockedGetLocationList = vi.mocked(getLocationList);

function useLocationsWithSearch() {
  return { locations: useLocations(), search: useLocation().search };
}

function renderUseLocations(route = '/settings/locations') {
  const queryClient = createTestQueryClient();
  const rendered = renderHook(() => useLocationsWithSearch(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[route]}>
            <Routes>
              <Route path="/settings/locations" element={children} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    )
  });
  return { queryClient, ...rendered };
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  setStoredToken(VALID_TEST_TOKEN);
  mockedGetLocationList.mockResolvedValue(listLocationsResponse);
});

describe('useLocations', () => {
  it('ejecuta la query con los parámetros de la URL', async () => {
    const { result } = renderUseLocations(
      '/settings/locations?page=2&limit=50&sort=createdAt&dir=desc'
    );

    await waitFor(() => {
      expect(result.current.locations.query.isSuccess).toBe(true);
    });

    expect(mockedGetLocationList).toHaveBeenCalledWith({
      pagination: { page: 2, limit: 50 },
      sort: { field: 'createdAt', direction: 'desc' }
    });
  });

  it('reinicia la página al cambiar el campo o dirección de orden', async () => {
    const { result } = renderUseLocations('/settings/locations?page=3');
    await waitFor(() => {
      expect(result.current.locations.query.isSuccess).toBe(true);
    });

    act(() => {
      result.current.locations.setSort('createdAt', 'desc');
    });

    const params = new URLSearchParams(result.current.search);
    expect(params.get('sort')).toBe('createdAt');
    expect(params.get('dir')).toBe('desc');
    expect(params.has('page')).toBe(false);
  });

  it('reinicia la página al cambiar el límite', async () => {
    const { result } = renderUseLocations('/settings/locations?page=3');
    await waitFor(() => {
      expect(result.current.locations.query.isSuccess).toBe(true);
    });

    act(() => {
      result.current.locations.setLimit(50);
    });

    const params = new URLSearchParams(result.current.search);
    expect(params.get('limit')).toBe('50');
    expect(params.has('page')).toBe(false);
  });

  it('actualiza la página al invocar setPage', async () => {
    const { result } = renderUseLocations('/settings/locations');
    await waitFor(() => {
      expect(result.current.locations.query.isSuccess).toBe(true);
    });

    act(() => {
      result.current.locations.setPage(4);
    });

    const params = new URLSearchParams(result.current.search);
    expect(params.get('page')).toBe('4');
  });
});
