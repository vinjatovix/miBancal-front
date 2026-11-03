import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocationForEdit } from '../../../../../src/pages/settings/locations/hooks/useLocationForEdit';
import { getLocationForEdit } from '../../../../../src/services/locations.service';
import { AuthProvider } from '../../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../../src/shared/auth/session';
import { VALID_TEST_TOKEN } from '../../../../fixtures/auth/authFixtures';
import { buildLocation } from '../../../../fixtures/locations/buildLocation';
import { createTestQueryClient } from '../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../src/services/locations.service', () => ({
  getLocationForEdit: vi.fn()
}));

const mockedGetLocationForEdit = vi.mocked(getLocationForEdit);

function renderHookForEdit(id: string | null) {
  const queryClient = createTestQueryClient();
  return renderHook(() => useLocationForEdit(id), {
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
  setStoredToken(VALID_TEST_TOKEN);
});

describe('useLocationForEdit', () => {
  it('obtiene el recurso completo y su ETag', async () => {
    const location = buildLocation({ id: 'loc-1' });
    mockedGetLocationForEdit.mockResolvedValue({ location, etag: '"1"' });

    const { result } = renderHookForEdit('loc-1');

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetLocationForEdit).toHaveBeenCalledWith('loc-1');
    expect(result.current.location).toEqual(location);
    expect(result.current.etag).toBe('"1"');
  });

  it('no ejecuta la query si el id es nulo o vacío', () => {
    renderHookForEdit(null);

    expect(mockedGetLocationForEdit).not.toHaveBeenCalled();
  });
});
