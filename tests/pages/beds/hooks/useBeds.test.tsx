import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useBeds } from '../../../../src/pages/beds/hooks/useBeds';
import { getBedList } from '../../../../src/services/beds.service';
import { AuthProvider } from '../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../src/shared/auth/session';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildBed } from '../../../fixtures/beds/buildBed';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

vi.mock('../../../../src/services/beds.service', () => ({
  getBedList: vi.fn()
}));

const mockedGetBedList = vi.mocked(getBedList);

function renderUseBeds(initialEntry = '/beds') {
  const queryClient = createTestQueryClient();
  return renderHook(() => useBeds(), {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[initialEntry]}>
            {children}
          </MemoryRouter>
        </AuthProvider>
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

describe('useBeds', () => {
  it('fetches beds with include=location and no location filter by default', async () => {
    const bed = buildBed({ name: 'Bancal A' });
    mockedGetBedList.mockResolvedValue([bed]);

    const { result } = renderUseBeds();

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });
    expect(mockedGetBedList).toHaveBeenCalledWith({
      include: 'location',
      locationId: undefined
    });
    expect(result.current.query.data).toEqual([bed]);
  });

  it('passes locationId from search params to query', async () => {
    const bed = buildBed({ name: 'Bancal B', locationId: 'loc-123' });
    mockedGetBedList.mockResolvedValue([bed]);

    const { result } = renderUseBeds('/beds?locationId=loc-123');

    await waitFor(() => {
      expect(result.current.query.isSuccess).toBe(true);
    });
    expect(mockedGetBedList).toHaveBeenCalledWith({
      include: 'location',
      locationId: 'loc-123'
    });
  });

  it('updates url location filter when setLocationFilter is called', async () => {
    mockedGetBedList.mockResolvedValue([]);

    const { result } = renderUseBeds('/beds');

    act(() => {
      result.current.setLocationFilter('loc-456');
    });

    expect(result.current.locationIdFilter).toBe('loc-456');
  });
});
