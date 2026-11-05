import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { useToggleBookmark } from '../../../src/shared/hooks/useToggleBookmark';
import {
  addPlantBookmark,
  removePlantBookmark
} from '../../../src/services/bookmarks.service';
import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { bookmarkKeys } from '../../../src/shared/reactQuery/bookmarkKeys';
import { plantKeys } from '../../../src/shared/reactQuery/plantKeys';
import { DEFAULT_PLANT_SORT } from '../../../src/services/plantListQuery';
import type { PlantListRequest } from '../../../src/services/plantListQuery';

import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { createTestQueryClient } from '../../test-utils/createTestQueryClient';

vi.mock('../../../src/services/bookmarks.service', () => ({
  addPlantBookmark: vi.fn(),
  removePlantBookmark: vi.fn()
}));

const mockedAdd = vi.mocked(addPlantBookmark);
const mockedRemove = vi.mocked(removePlantBookmark);
const USER_ID = '00000000-0000-4000-8000-000000000001';
const LIST_KEY = bookmarkKeys.list(USER_ID);

function seedBookmarks(
  queryClient: ReturnType<typeof createTestQueryClient>,
  plantIds: readonly string[]
) {
  queryClient.setQueryDefaults(LIST_KEY, { gcTime: Infinity });
  queryClient.setQueryData(LIST_KEY, new Set(plantIds));
}

function renderUseToggleBookmark(
  queryClient = createTestQueryClient(),
  route = '/plants'
) {
  return {
    queryClient,
    ...renderHook(() => useToggleBookmark(), {
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
  setStoredToken(VALID_TEST_TOKEN);
});

describe('useToggleBookmark: actualización optimista', () => {
  it('añade el plantId al instante antes de que resuelva la petición', async () => {
    let resolveAdd!: () => void;
    mockedAdd.mockImplementation(
      () =>
        new Promise(
          (resolve) => (resolveAdd = () => resolve(undefined as never))
        )
    );
    const { queryClient, result } = renderUseToggleBookmark();
    seedBookmarks(queryClient, ['other']);

    act(() => {
      result.current.mutate({ plantId: 'p-1', isFavorite: false });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(LIST_KEY)).toEqual(
        new Set(['other', 'p-1'])
      );
    });

    await act(async () => {
      resolveAdd();
    });
  });

  it('quita el plantId al instante al desmarcar', async () => {
    mockedRemove.mockResolvedValue(undefined);
    const { queryClient, result } = renderUseToggleBookmark();
    seedBookmarks(queryClient, ['p-1', 'p-2']);

    act(() => {
      result.current.mutate({ plantId: 'p-1', isFavorite: true });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(LIST_KEY)).toEqual(new Set(['p-2']));
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useToggleBookmark: reversión ante error', () => {
  it('restaura el snapshot previo y propaga el error', async () => {
    mockedAdd.mockRejectedValue(new Error('network down'));
    const { queryClient, result } = renderUseToggleBookmark();
    const snapshot = new Set(['other']);
    seedBookmarks(queryClient, [...snapshot]);

    act(() => {
      result.current.mutate({ plantId: 'p-1', isFavorite: false });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(queryClient.getQueryData(LIST_KEY)).toEqual(snapshot);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('al fallar solo revierte su planta y conserva el resto de membresías', async () => {
    mockedAdd.mockRejectedValue(new Error('network down'));
    const queryClient = createTestQueryClient();
    seedBookmarks(queryClient, []);

    const first = renderUseToggleBookmark(queryClient);
    const second = renderUseToggleBookmark(queryClient);

    act(() => {
      first.result.current.mutate({ plantId: 'a', isFavorite: false });
    });
    act(() => {
      second.result.current.mutate({ plantId: 'b', isFavorite: false });
    });

    await waitFor(() => {
      expect(first.result.current.isError).toBe(true);
      expect(second.result.current.isError).toBe(true);
    });

    expect(queryClient.getQueryData(LIST_KEY)).toEqual(new Set());
  });
});

describe('useToggleBookmark: invalidación', () => {
  const PLAIN_LIST_REQUEST: PlantListRequest = {
    filters: {},
    pagination: { page: 1, limit: 12 },
    sort: DEFAULT_PLANT_SORT
  };
  const FAVORITES_LIST_REQUEST: PlantListRequest = {
    filters: { bookmarked: 'true' },
    pagination: { page: 1, limit: 12 },
    sort: DEFAULT_PLANT_SORT
  };
  const PLAIN_LIST_KEY = plantKeys.list(PLAIN_LIST_REQUEST, 'public');
  const FAVORITES_LIST_KEY = [
    ...plantKeys.list(FAVORITES_LIST_REQUEST, 'public'),
    USER_ID
  ] as const;

  it('invalida bookmarkKeys.list(userId) al finalizar', async () => {
    mockedAdd.mockResolvedValue(undefined as never);
    const { queryClient, result } = renderUseToggleBookmark();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    act(() => {
      result.current.mutate({ plantId: 'p-1', isFavorite: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: LIST_KEY });
  });

  it('no refetchea el catálogo plano: los datos de la planta no cambian al togglear', async () => {
    mockedAdd.mockResolvedValue(undefined as never);
    const { queryClient, result } = renderUseToggleBookmark();
    queryClient.setQueryDefaults(PLAIN_LIST_KEY, { gcTime: Infinity });
    queryClient.setQueryData(PLAIN_LIST_KEY, {
      data: [],
      pagination: { page: 1, limit: 12, totalItems: 0, totalPages: 0 }
    });

    act(() => {
      result.current.mutate({ plantId: 'p-1', isFavorite: false });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(PLAIN_LIST_KEY)?.isInvalidated).toBe(
      false
    );
  });

  it('refetchea las listas filtradas por favoritos, cuyo resultado sí cambia', async () => {
    mockedRemove.mockResolvedValue(undefined);
    const { queryClient, result } = renderUseToggleBookmark();
    queryClient.setQueryDefaults(FAVORITES_LIST_KEY, { gcTime: Infinity });
    queryClient.setQueryData(FAVORITES_LIST_KEY, {
      data: [],
      pagination: { page: 1, limit: 12, totalItems: 0, totalPages: 0 }
    });

    act(() => {
      result.current.mutate({ plantId: 'p-1', isFavorite: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(FAVORITES_LIST_KEY)?.isInvalidated).toBe(
      true
    );
  });
});
