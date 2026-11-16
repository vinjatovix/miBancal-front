import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import BedPlacementEditor from '../../src/pages/beds/BedDetailPage/BedPlacementEditor';
import { getPlantInstancesByBed } from '../../src/services/plantInstances.service';
import { getPlantList } from '../../src/services/plants.service';
import {
  clearStoredToken,
  setStoredToken
} from '../../src/shared/auth/session';
import { VALID_TEST_TOKEN } from '../fixtures/auth/authFixtures';
import { buildBed } from '../fixtures/beds/buildBed';
import { buildPlantListItem } from '../fixtures/plants/buildPlantListItem';
import { expectNoAxeViolations } from '../test-utils/axe';
import { renderWithProviders } from '../test-utils/renderWithProviders';
import '../../src/i18n/messages/beds';

vi.mock('../../src/services/plantInstances.service', () => ({
  getPlantInstancesByBed: vi.fn(),
  createPlantInstance: vi.fn(),
  updatePlantInstance: vi.fn(),
  deletePlantInstance: vi.fn()
}));

vi.mock('../../src/services/plants.service', () => ({
  getPlantList: vi.fn()
}));

const bed = buildBed({ name: 'Bancal Norte', width: 100, height: 200 });
const tomato = buildPlantListItem({
  id: 'plant-tomato',
  identity: {
    name: { primary: 'Tomate', aliases: [] },
    scientificName: 'Solanum lycopersicum',
    family: 'fam-1'
  }
});

beforeEach(() => {
  vi.clearAllMocks();
  clearStoredToken();
  setStoredToken(VALID_TEST_TOKEN);
  vi.mocked(getPlantInstancesByBed).mockResolvedValue({
    data: [],
    etag: '"e"'
  });
  vi.mocked(getPlantList).mockResolvedValue({
    data: [tomato],
    pagination: { page: 1, limit: 50, totalPages: 1, totalItems: 1 }
  });
});

afterEach(() => {
  clearStoredToken();
});

describe('Bed plant placement a11y', () => {
  it.each(['light', 'dark'] as const)(
    'has no axe violations in %s theme',
    async (theme) => {
      const { container } = renderWithProviders(
        <BedPlacementEditor bed={bed} />
      );

      await waitFor(() => {
        expect(screen.getByText('Tomate')).toBeInTheDocument();
      });

      await expectNoAxeViolations(container, { theme });
    }
  );
});
