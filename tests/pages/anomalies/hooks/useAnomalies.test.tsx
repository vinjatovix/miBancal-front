import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { useAnomalies } from '../../../../src/pages/anomalies/hooks/useAnomalies';
import { getAnomalyList } from '../../../../src/services/anomalies.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { anomalyKeys } from '../../../../src/shared/reactQuery/anomalyKeys';
import type { AnomalyListItem } from '../../../../src/types/Anomaly/Anomaly';
import type { PaginatedResponse } from '../../../../src/types/api';
import {
  COLLABORATOR_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../../fixtures/auth/authFixtures';
import { buildAnomalyListItem } from '../../../fixtures/anomalies/buildAnomaly';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/anomalies.service', () => ({
  getAnomalyList: vi.fn()
}));

const mockedGetAnomalyList = vi.mocked(getAnomalyList);

const response: PaginatedResponse<AnomalyListItem> = {
  data: [buildAnomalyListItem()],
  pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 1 }
};

function useAnomaliesWithLocation() {
  return { anomalies: useAnomalies(), search: useLocation().search };
}

function renderUseAnomalies(route = '/anomalies') {
  const queryClient = createTestQueryClient();
  const rendered = renderHook(() => useAnomaliesWithLocation(), {
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

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  mockedGetAnomalyList.mockResolvedValue(response);
});

describe('useAnomalies', () => {
  it('mapea la URL a la petición del listado', async () => {
    const { result } = renderUseAnomalies(
      '/anomalies?category=disorder&sortField=slug&sortDirection=desc&page=2&limit=50'
    );

    await waitFor(() =>
      expect(result.current.anomalies.query.isSuccess).toBe(true)
    );

    expect(mockedGetAnomalyList).toHaveBeenCalledWith({
      filters: { category: 'disorder' },
      pagination: { page: 2, limit: 50 },
      sort: { field: 'slug', direction: 'desc' }
    });
    expect(result.current.anomalies.hasActiveFilters).toBe(true);
  });

  it('reinicia la página al cambiar el orden', async () => {
    const { result } = renderUseAnomalies('/anomalies?page=3');
    await waitFor(() =>
      expect(result.current.anomalies.query.isSuccess).toBe(true)
    );

    act(() => result.current.anomalies.setSort('slug', 'desc'));

    const params = new URLSearchParams(result.current.search);
    expect(params.get('sortField')).toBe('slug');
    expect(params.get('sortDirection')).toBe('desc');
    expect(params.has('page')).toBe(false);
  });

  it('reinicia la página al cambiar el límite', async () => {
    const { result } = renderUseAnomalies('/anomalies?page=3');
    await waitFor(() =>
      expect(result.current.anomalies.query.isSuccess).toBe(true)
    );

    act(() => result.current.anomalies.setLimit(50));

    const params = new URLSearchParams(result.current.search);
    expect(params.get('limit')).toBe('50');
    expect(params.has('page')).toBe(false);
  });

  it('setPage fija la página y goToFirstPage la elimina', async () => {
    const { result } = renderUseAnomalies('/anomalies?category=pest');
    await waitFor(() =>
      expect(result.current.anomalies.query.isSuccess).toBe(true)
    );

    act(() => result.current.anomalies.setPage(4));
    expect(new URLSearchParams(result.current.search).get('page')).toBe('4');

    act(() => result.current.anomalies.goToFirstPage());
    expect(new URLSearchParams(result.current.search).has('page')).toBe(false);
  });

  it('clearFilters elimina la categoría y reinicia la página', async () => {
    const { result } = renderUseAnomalies(
      '/anomalies?category=pest&page=2&limit=50'
    );
    await waitFor(() =>
      expect(result.current.anomalies.query.isSuccess).toBe(true)
    );

    act(() => result.current.anomalies.clearFilters());

    expect(new URLSearchParams(result.current.search).toString()).toBe(
      'limit=50'
    );
  });

  it('usa el scope public en la queryKey para anónimos y usuarios sin rol editorial', async () => {
    setStoredToken(VALID_TEST_TOKEN);
    const { result, queryClient } = renderUseAnomalies();
    await waitFor(() =>
      expect(result.current.anomalies.query.isSuccess).toBe(true)
    );

    expect(
      queryClient.getQueryData(
        anomalyKeys.list(result.current.anomalies.request, 'public')
      )
    ).toEqual(response);
  });

  it('usa el scope editorial en la queryKey para collaborator', async () => {
    setStoredToken(COLLABORATOR_TEST_TOKEN);
    const { result, queryClient } = renderUseAnomalies();
    await waitFor(() =>
      expect(result.current.anomalies.query.isSuccess).toBe(true)
    );

    expect(
      queryClient.getQueryData(
        anomalyKeys.list(result.current.anomalies.request, 'editorial')
      )
    ).toEqual(response);
  });
});
