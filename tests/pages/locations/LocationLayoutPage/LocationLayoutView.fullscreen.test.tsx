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

describe('LocationLayoutView - fullscreen mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    mockedGetLocationLayout.mockResolvedValue({
      layout: buildLocationLayout(),
      etag: '"1"'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('enters fullscreen when clicking the fullscreen button in the floating dock', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    await user.click(
      await screen.findByRole('button', { name: 'Pantalla completa' })
    );

    const readPage = () => container.querySelector('.location-layout-page');
    expect(readPage()).toHaveClass('location-layout-page--fullscreen');
  });

  it('exits fullscreen when clicking the exit fullscreen button in the floating dock', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });
    await user.click(
      await screen.findByRole('button', { name: 'Pantalla completa' })
    );

    await user.click(
      screen.getByRole('button', { name: 'Salir de pantalla completa' })
    );

    const readPage = () => container.querySelector('.location-layout-page');
    expect(readPage()).not.toHaveClass('location-layout-page--fullscreen');
  });

  it('restores standard navigation when Escape is pressed', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    await user.click(
      await screen.findByRole('button', { name: 'Pantalla completa' })
    );

    const readPage = () => container.querySelector('.location-layout-page');
    expect(readPage()).toHaveClass('location-layout-page--fullscreen');

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(readPage()).not.toHaveClass('location-layout-page--fullscreen');
    });
  });
});
