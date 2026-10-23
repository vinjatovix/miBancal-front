import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { useBookmarks } from '../../../src/shared/hooks/useBookmarks';
import { getBookmarkedPlantIds } from '../../../src/services/bookmarks.service';
import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { bookmarkKeys } from '../../../src/shared/reactQuery/bookmarkKeys';

import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { createTestQueryClient } from '../../test-utils/createTestQueryClient';

vi.mock('../../../src/services/bookmarks.service', () => ({
  getBookmarkedPlantIds: vi.fn()
}));

const mockedGetBookmarkedPlantIds = vi.mocked(getBookmarkedPlantIds);

function renderUseBookmarks(queryClient = createTestQueryClient()) {
  return renderHook(() => useBookmarks(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    )
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
});

describe('useBookmarks: sin sesión', () => {
  it('no dispara la query', () => {
    const { result } = renderUseBookmarks();

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockedGetBookmarkedPlantIds).not.toHaveBeenCalled();
  });
});

describe('useBookmarks: con sesión', () => {
  beforeEach(() => {
    setStoredToken(VALID_TEST_TOKEN);
    mockedGetBookmarkedPlantIds.mockResolvedValue(new Set(['p-1', 'p-2']));
  });

  it('devuelve el Set de plantId favoritos', async () => {
    const { result } = renderUseBookmarks();

    await waitFor(() => {
      expect(result.current.data).toEqual(new Set(['p-1', 'p-2']));
    });
    expect(mockedGetBookmarkedPlantIds).toHaveBeenCalledOnce();
  });

  it('registra la consulta con bookmarkKeys.list(userId)', async () => {
    const queryClient = createTestQueryClient();

    renderUseBookmarks(queryClient);

    await waitFor(() => {
      const entry = queryClient.getQueryCache().find({
        queryKey: bookmarkKeys.list('00000000-0000-4000-8000-000000000001')
      });
      expect(entry).toBeDefined();
    });
  });
});
