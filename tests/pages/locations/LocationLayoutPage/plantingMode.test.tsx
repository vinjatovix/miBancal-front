import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
    data: [
      {
        id: 'plant-1',
        identity: { name: { primary: 'Tomate Corazón de Buey' } },
        traits: { spacingCm: { min: 40 } }
      }
    ],
    pagination: { page: 1, limit: 50, totalPages: 1, totalItems: 1 }
  })
}));

vi.mock('../../../../src/services/plantInstances.service', () => ({
  getPlantInstancesByBed: vi.fn().mockResolvedValue({
    data: [
      {
        id: 'instance-1',
        bedId: '22222222-2222-4222-8222-222222222221',
        plantId: 'plant-1',
        commonName: 'Tomate',
        instanceStatus: 'active',
        vitalRadius: 20,
        position: { x: 30, y: 30 },
        growthStatus: 'planted',
        version: 1
      }
    ],
    etag: '"etag-1"'
  })
}));

const mockedGetLocationLayout = vi.mocked(getLocationLayout);
const PATH = '/locations/:id/layout';
const ROUTE = '/locations/loc-1/layout';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LocationLayoutPage - Planting Mode', () => {
  it('opens botanical catalog palette in context panel upon entering planting mode', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    const user = userEvent.setup();

    renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    const plantingRadio = screen.getByRole('radio', { name: 'Sembrar' });
    await user.click(plantingRadio);

    expect(
      screen.getByRole('heading', { name: 'Catálogo botánico' })
    ).toBeInTheDocument();
  });

  it('renders existing plant instances on placed beds in planting mode', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    const user = userEvent.setup();

    renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    await user.click(await screen.findByRole('radio', { name: 'Sembrar' }));

    const cropNode = await screen.findByRole('button', {
      name: /Tomate en 30, 30 centímetros/i
    });
    expect(cropNode).toBeInTheDocument();
  });

  it('searches and displays matching plant species in the botanical catalog', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    const user = userEvent.setup();

    renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    await user.click(await screen.findByRole('radio', { name: 'Sembrar' }));

    const searchInput = screen.getByPlaceholderText(
      'Busca por nombre o especie'
    );
    await user.type(searchInput, 'Tomate');

    expect(
      await screen.findByRole('button', {
        name: 'Sembrar Tomate Corazón de Buey'
      })
    ).toBeInTheDocument();
  });

  it('activates plant for placement when selecting it from the catalog', async () => {
    mockedGetLocationLayout.mockResolvedValueOnce({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
    const user = userEvent.setup();

    renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    await user.click(await screen.findByRole('radio', { name: 'Sembrar' }));

    const searchInput = screen.getByPlaceholderText(
      'Busca por nombre o especie'
    );
    await user.type(searchInput, 'Tomate');

    const plantCard = await screen.findByRole('button', {
      name: 'Sembrar Tomate Corazón de Buey'
    });
    await user.click(plantCard);

    expect(plantCard).toHaveAttribute('aria-pressed', 'true');
  });
});
