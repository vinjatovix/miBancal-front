import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LocationLayoutPage from '../../../../src/pages/locations/LocationLayoutPage/LocationLayoutPage';
import { getLocationLayout } from '../../../../src/services/locations.service';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { buildLocationLayout } from '../../../fixtures/locations/buildLocationLayout';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

vi.mock('../../../../src/services/locations.service', () => ({
  getLocationLayout: vi.fn(),
  getLocationList: vi.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 100, totalPages: 1, totalItems: 0 }
  }),
  updateLocation: vi.fn()
}));

vi.mock('../../../../src/services/beds.service', () => ({
  createBed: vi.fn(),
  deleteBed: vi.fn(),
  getBedForEdit: vi.fn(),
  getBedList: vi.fn(),
  updateBed: vi.fn()
}));

vi.mock('../../../../src/services/plants.service', () => ({
  getPlantById: vi.fn().mockResolvedValue({
    id: 'plant-1',
    identity: { name: { primary: 'Tomate' } },
    traits: { spacingCm: { min: 40 } }
  }),
  getPlantList: vi.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 50, totalPages: 1, totalItems: 0 }
  })
}));

vi.mock('../../../../src/services/plantInstances.service', () => ({
  getPlantInstancesByBed: vi.fn().mockResolvedValue({ data: [], etag: '"e"' })
}));

vi.mock('../../../../src/services/plantRelations.service', () => ({
  getPlantRelations: vi.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, limit: 100, totalPages: 1, totalItems: 0 }
  })
}));

const mockedGetLocationLayout = vi.mocked(getLocationLayout);
const PATH = '/locations/:id/layout';
const ROUTE = '/locations/loc-1/layout';

function mockCoarsePointer(): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }));
}

describe('LocationLayoutView - mobile inspection mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCoarsePointer();
    mockedGetLocationLayout.mockResolvedValue({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens in read-only inspection on mobile', async () => {
    renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    expect(screen.getByText('Solo lectura')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Activar edición' })
    ).toBeInTheDocument();
  });

  it('does not let editing take effect until editing is explicitly enabled', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    await user.click(await screen.findByRole('radio', { name: 'Sembrar' }));

    expect(
      screen.queryByRole('heading', { name: 'Catálogo botánico' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Activar edición' }));
    expect(screen.getByText('Edición activa')).toBeInTheDocument();

    await user.click(await screen.findByRole('radio', { name: 'Sembrar' }));
    expect(
      screen.getByRole('heading', { name: 'Catálogo botánico' })
    ).toBeInTheDocument();
  });
});
