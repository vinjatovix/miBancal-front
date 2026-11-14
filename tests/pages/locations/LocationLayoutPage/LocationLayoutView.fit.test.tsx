import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as viewportFitTarget from '../../../../src/components/beds/layout/utils/viewportFitTarget';
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

describe('LocationLayoutView - fit control', () => {
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

  it('resolves contextual fit bounds for placed beds when clicking fit button', async () => {
    const spy = vi.spyOn(viewportFitTarget, 'resolveFitBounds');
    const user = userEvent.setup();
    renderWithProviders(<LocationLayoutPage />, {
      path: PATH,
      route: ROUTE,
      initialToken: VALID_TEST_TOKEN
    });

    const fitButton = await screen.findByRole('button', {
      name: 'Centrar y restablecer el zoom'
    });
    spy.mockClear();

    await user.click(fitButton);

    expect(spy).toHaveBeenCalledWith(null, expect.any(Array));
  });
});
