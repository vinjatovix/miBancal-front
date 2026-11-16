import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBedDetail } from '../../../../src/pages/beds/hooks/useBedDetail';
import { getBedById } from '../../../../src/services/beds.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { ApiError } from '../../../../src/shared/errors/ApiError';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildBed } from '../../../fixtures/beds/buildBed';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/beds.service', () => ({
  getBedById: vi.fn()
}));

const mockedGetBedById = vi.mocked(getBedById);

function renderUseBedDetail(id: string) {
  const queryClient = createTestQueryClient();
  return renderHook(() => useBedDetail(id), {
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

describe('useBedDetail', () => {
  it('loads bed details successfully', async () => {
    const bed = buildBed();
    mockedGetBedById.mockResolvedValueOnce(bed);

    const { result } = renderUseBedDetail(bed.id);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    expect(result.current.data).toEqual(bed);
    expect(mockedGetBedById).toHaveBeenCalledWith(bed.id, 'location');
  });

  it('handles not found error response', async () => {
    const error = new ApiError('Not found', 404);
    mockedGetBedById.mockRejectedValueOnce(error);

    const { result } = renderUseBedDetail('non-existent');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(result.current.error).toEqual(error);
  });
});
