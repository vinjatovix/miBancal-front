import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { usePlants } from '../../../../src/pages/plants/hooks/usePlants';
import { parsePlantListSearchParams } from '../../../../src/pages/plants/utils/parsePlantListSearchParams';
import { getPlantList } from '../../../../src/services/plants.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { plantKeys } from '../../../../src/shared/reactQuery/plantKeys';
import type { PaginatedResponse } from '../../../../src/types/api';
import type { PlantListItem } from '../../../../src/types/Plants/Plant';

import {
  ADMIN_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../../fixtures/auth/authFixtures';
import { listPlantsResponse } from '../../../fixtures/plants/listPlants';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/plants.service', () => ({
  getPlantList: vi.fn()
}));

const mockedGetPlantList = vi.mocked(getPlantList);

function usePlantsWithLocation() {
  return { plants: usePlants(), search: useLocation().search };
}

function renderUsePlants(route = '/plants') {
  const queryClient = createTestQueryClient();
  return renderHook(() => usePlantsWithLocation(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="*" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  });
}

function searchParams(search: string) {
  return new URLSearchParams(search);
}

function renderUsePlantsAuthenticated(route = '/plants') {
  const queryClient = createTestQueryClient();
  setStoredToken(VALID_TEST_TOKEN);
  return {
    queryClient,
    ...renderHook(() => usePlantsWithLocation(), {
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
    })
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  mockedGetPlantList.mockResolvedValue(listPlantsResponse);
});

describe('usePlants: query', () => {
  it('expone la carga mientras no llega la respuesta', () => {
    mockedGetPlantList.mockImplementation(
      () => new Promise<PaginatedResponse<PlantListItem>>(() => {})
    );

    const { result } = renderUsePlants();

    expect(result.current.plants.query.isLoading).toBe(true);
  });

  it('expone los datos al llegar la respuesta', async () => {
    const { result } = renderUsePlants();

    await waitFor(() => {
      expect(result.current.plants.query.data).toEqual(listPlantsResponse);
    });
  });

  it('expone el error de la API', async () => {
    mockedGetPlantList.mockRejectedValue(new Error('API error'));

    const { result } = renderUsePlants();

    await waitFor(() => {
      expect(result.current.plants.query.error).toBeInstanceOf(Error);
    });
  });

  it('registra la consulta con scope public cuando no hay sesión de admin', async () => {
    const queryClient = createTestQueryClient();

    renderHook(() => usePlantsWithLocation(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MemoryRouter initialEntries={['/plants']}>
              <Routes>
                <Route path="*" element={children} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      )
    });

    await waitFor(() => {
      const entry = queryClient.getQueryCache().find({
        queryKey: plantKeys.list(
          parsePlantListSearchParams(new URLSearchParams()),
          'public'
        )
      });
      expect(entry).toBeDefined();
    });
  });

  it('registra la consulta con scope admin cuando la sesión es de admin', async () => {
    setStoredToken(ADMIN_TEST_TOKEN);
    const queryClient = createTestQueryClient();

    renderHook(() => usePlantsWithLocation(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <MemoryRouter initialEntries={['/plants']}>
              <Routes>
                <Route path="*" element={children} />
              </Routes>
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      )
    });

    await waitFor(() => {
      const entry = queryClient.getQueryCache().find({
        queryKey: plantKeys.list(
          parsePlantListSearchParams(new URLSearchParams()),
          'admin'
        )
      });
      expect(entry).toBeDefined();
    });
  });
});

describe('usePlants: petición', () => {
  const route =
    '/plants?page=2&limit=50&sortField=scientificName&sortDirection=desc&lifeCycle=annual';

  it('la petición es la de parsePlantListSearchParams sobre la URL', () => {
    const { result } = renderUsePlants(route);

    expect(result.current.plants.request).toEqual(
      parsePlantListSearchParams(searchParams(route.split('?')[1]))
    );
  });

  it('llama a getPlantList con la petición completa', async () => {
    const { result } = renderUsePlants(route);
    const { request } = result.current.plants;

    await waitFor(() => {
      expect(mockedGetPlantList).toHaveBeenCalledWith(request);
    });
  });
});

describe('usePlants: setters', () => {
  const route =
    '/plants?page=3&limit=25&sortField=name&sortDirection=asc&lifeCycle=annual';

  it('setLimit escribe su parámetro, borra page y conserva el resto', async () => {
    const { result } = renderUsePlants(route);

    act(() => {
      result.current.plants.setLimit(50);
    });

    await waitFor(() => {
      const params = searchParams(result.current.search);
      expect(params.get('limit')).toBe('50');
      expect(params.has('page')).toBe(false);
      expect(params.get('lifeCycle')).toBe('annual');
    });
    expect(result.current.plants.request.pagination.page).toBe(1);
  });

  it('setSort fija criterio y dirección en una única actualización y borra page', async () => {
    const { result } = renderUsePlants(route);

    act(() => {
      result.current.plants.setSort('scientificName', 'desc');
    });

    await waitFor(() => {
      const params = searchParams(result.current.search);
      expect(params.get('sortField')).toBe('scientificName');
      expect(params.get('sortDirection')).toBe('desc');
      expect(params.has('page')).toBe(false);
      expect(params.get('lifeCycle')).toBe('annual');
    });
    expect(result.current.plants.request.sort).toEqual({
      field: 'scientificName',
      direction: 'desc'
    });
  });

  it('setPage escribe page y conserva orden, límite y filtros', async () => {
    const { result } = renderUsePlants(route);

    act(() => {
      result.current.plants.setPage(4);
    });

    await waitFor(() => {
      expect(result.current.plants.request.pagination.page).toBe(4);
    });
    const params = searchParams(result.current.search);
    expect(params.get('sortField')).toBe('name');
    expect(params.get('sortDirection')).toBe('asc');
    expect(params.get('limit')).toBe('25');
    expect(params.get('lifeCycle')).toBe('annual');
  });
});

describe('usePlants: removeFilter', () => {
  it('quitar un descriptor borra su parámetro y reinicia page', async () => {
    const { result } = renderUsePlants(
      '/plants?page=3&limit=50&lifeCycle=annual&identity=tomate'
    );

    act(() => {
      result.current.plants.removeFilter({
        id: 'lifeCycle',
        label: 'Anual',
        param: 'lifeCycle'
      });
    });

    await waitFor(() => {
      const params = searchParams(result.current.search);
      expect(params.has('lifeCycle')).toBe(false);
      expect(params.has('page')).toBe(false);
    });
    const params = searchParams(result.current.search);
    expect(params.get('identity')).toBe('tomate');
    expect(params.get('limit')).toBe('50');
  });

  it('para sowingMonths borra solo el valor indicado conservando el resto', async () => {
    const { result } = renderUsePlants('/plants?sowingMonth=3&sowingMonth=5');

    act(() => {
      result.current.plants.removeFilter({
        id: 'sowingMonths:3',
        label: 'Marzo',
        param: 'sowingMonth',
        value: '3'
      });
    });

    await waitFor(() => {
      expect(searchParams(result.current.search).getAll('sowingMonth')).toEqual(
        ['5']
      );
    });
  });

  it('hemisphere vuelve a north al quitarse', async () => {
    const { result } = renderUsePlants('/plants?hemisphere=south');

    act(() => {
      result.current.plants.removeFilter({
        id: 'hemisphere',
        label: 'Hemisferio: Sur',
        param: 'hemisphere'
      });
    });

    await waitFor(() => {
      expect(searchParams(result.current.search).has('hemisphere')).toBe(false);
    });
  });
});

describe('usePlants: vacíos y filtros', () => {
  const route =
    '/plants?page=3&limit=50&sortField=name&sortDirection=desc&hemisphere=south&identity=tomate&lifeCycle=annual';

  it('hasActiveFilters es true si la URL tiene filtros válidos', () => {
    const { result } = renderUsePlants(route);

    expect(result.current.plants.hasActiveFilters).toBe(true);
  });

  it('hasActiveFilters es false sin filtros o con filtros no válidos', () => {
    const { result } = renderUsePlants(
      '/plants?limit=50&hemisphere=south&lifeCycle=invented'
    );

    expect(result.current.plants.hasActiveFilters).toBe(false);
  });

  it('clearFilters deja en la URL solo orden, límite y hemisferio', async () => {
    const { result } = renderUsePlants(route);

    act(() => {
      result.current.plants.clearFilters();
    });

    await waitFor(() => {
      expect(searchParams(result.current.search).toString()).toBe(
        'limit=50&sortField=name&sortDirection=desc&hemisphere=south'
      );
    });
    expect(result.current.plants.hasActiveFilters).toBe(false);
  });

  it('goToFirstPage quita la página fuera de rango y conserva el resto', async () => {
    const { result } = renderUsePlants(route);

    act(() => {
      result.current.plants.goToFirstPage();
    });

    await waitFor(() => {
      expect(result.current.plants.request.pagination.page).toBe(1);
    });
    const params = searchParams(result.current.search);
    expect(params.get('identity')).toBe('tomate');
    expect(params.get('limit')).toBe('50');
  });
});

describe('usePlants: pestaña de favoritas', () => {
  it('con sesión y tab=favorites inyecta bookmarked:true en la petición', () => {
    const { result } = renderUsePlantsAuthenticated('/plants?tab=favorites');

    expect(result.current.plants.request.filters.bookmarked).toBe('true');
  });

  it('con sesión y tab=favorites incluye el userId en la queryKey', async () => {
    const { queryClient, result } = renderUsePlantsAuthenticated(
      '/plants?tab=favorites'
    );

    await waitFor(() => {
      const entry = queryClient.getQueryCache().find({
        queryKey: [
          ...plantKeys.list(result.current.plants.request, 'public'),
          '00000000-0000-4000-8000-000000000001'
        ]
      });
      expect(entry).toBeDefined();
    });
  });

  it('sin sesión ignora tab=favorites y nunca añade bookmarked', () => {
    const { result } = renderUsePlants('/plants?tab=favorites');

    expect(result.current.plants.request.filters.bookmarked).toBeUndefined();
  });

  it('con tab=favorites y sin otros filtros, hasActiveFilters es false', () => {
    const { result } = renderUsePlantsAuthenticated('/plants?tab=favorites');

    expect(result.current.plants.request.filters.bookmarked).toBe('true');
    expect(result.current.plants.hasActiveFilters).toBe(false);
  });

  it('con tab=favorites y un filtro real, hasActiveFilters es true', () => {
    const { result } = renderUsePlantsAuthenticated(
      '/plants?tab=favorites&edible=true'
    );

    expect(result.current.plants.hasActiveFilters).toBe(true);
  });
});
