import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BedDetailRedirect from '../../../src/pages/beds/BedDetailRedirect/BedDetailRedirect';
import { getBedById } from '../../../src/services/beds.service';
import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { buildBed } from '../../fixtures/beds/buildBed';
import { createTestQueryClient } from '../../test-utils/createTestQueryClient';

vi.mock('../../../src/services/beds.service', () => ({
  getBedById: vi.fn()
}));

const mockedGetBedById = vi.mocked(getBedById);

function renderRedirect(bedId = '3fa85f64-5717-4562-b3fc-2c963f66afa6') {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[`/beds/${bedId}`]}>
          <Routes>
            <Route path="/beds/:id" element={<BedDetailRedirect />} />
            <Route path="/beds" element={<div>beds-list</div>} />
            <Route
              path="/locations/:id/layout"
              element={<div>layout-page</div>}
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  setStoredToken(VALID_TEST_TOKEN);
});

afterEach(() => {
  clearStoredToken();
});

describe('BedDetailRedirect', () => {
  it('redirects a placed bed to its location layout', async () => {
    mockedGetBedById.mockResolvedValue(
      buildBed({
        id: 'bed-1',
        locationId: 'loc-9'
      })
    );

    renderRedirect('bed-1');

    await waitFor(() => {
      expect(screen.getByText('layout-page')).toBeInTheDocument();
    });
  });

  it('redirects a bed without location to the beds list', async () => {
    mockedGetBedById.mockResolvedValue(
      buildBed({ id: 'bed-2', locationId: null, location: null })
    );

    renderRedirect('bed-2');

    await waitFor(() => {
      expect(screen.getByText('beds-list')).toBeInTheDocument();
    });
  });
});
