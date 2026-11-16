import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlantPlacementPalette from '../../../../src/components/beds/visualizer/PlantPlacementPalette';
import { getPlantList } from '../../../../src/services/plants.service';
import { buildPlantListItem } from '../../../fixtures/plants/buildPlantListItem';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';
import '../../../../src/i18n/messages/beds';

vi.mock('../../../../src/services/plants.service', () => ({
  getPlantList: vi.fn()
}));

const mockedGetPlantList = vi.mocked(getPlantList);

const tomato = buildPlantListItem({
  id: 'plant-tomato',
  identity: {
    name: { primary: 'Tomate', aliases: [] },
    scientificName: 'Solanum lycopersicum',
    family: 'fam-1'
  }
});

function stubCatalog(items = [tomato]) {
  mockedGetPlantList.mockResolvedValue({
    data: items,
    pagination: { page: 1, limit: 50, totalPages: 1, totalItems: items.length }
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  stubCatalog();
});

describe('PlantPlacementPalette', () => {
  it('shows a search prompt and loads nothing by default', async () => {
    renderWithProviders(
      <PlantPlacementPalette isOpen onSelectPlant={vi.fn()} />
    );

    expect(
      screen.getByText(
        'Busca una planta por nombre o elige tus favoritas para empezar.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Tomate')).not.toBeInTheDocument();
    expect(mockedGetPlantList).not.toHaveBeenCalled();
  });

  it('lists catalog plants once the user searches', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PlantPlacementPalette isOpen onSelectPlant={vi.fn()} />
    );

    await user.type(screen.getByRole('searchbox'), 'tom');

    expect(await screen.findByText('Tomate')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockedGetPlantList).toHaveBeenCalledWith(
        expect.objectContaining({ filters: { identity: 'tom' } })
      );
    });
  });

  it('loads the bookmarked plants when favorites is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PlantPlacementPalette isOpen onSelectPlant={vi.fn()} />
    );

    await user.click(screen.getByRole('button', { name: 'Mis favoritas' }));

    expect(await screen.findByText('Tomate')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockedGetPlantList).toHaveBeenCalledWith(
        expect.objectContaining({ filters: { bookmarked: 'true' } })
      );
    });
  });

  it('transfers the plant id on desktop drag start', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <PlantPlacementPalette isOpen onSelectPlant={vi.fn()} />
    );
    await user.click(screen.getByRole('button', { name: 'Mis favoritas' }));
    const card = await screen.findByRole('button', { name: 'Sembrar Tomate' });

    const setData = vi.fn();
    const dataTransfer = { setData, effectAllowed: '' };
    card.dispatchEvent(
      Object.assign(new Event('dragstart', { bubbles: true }), {
        dataTransfer
      })
    );

    expect(setData).toHaveBeenCalledWith(
      'application/x-plant-id',
      'plant-tomato'
    );
  });

  it('activates tap-to-place when a plant card is tapped', async () => {
    const onSelectPlant = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(
      <PlantPlacementPalette isOpen onSelectPlant={onSelectPlant} />
    );
    await user.click(screen.getByRole('button', { name: 'Mis favoritas' }));
    const card = await screen.findByRole('button', { name: 'Sembrar Tomate' });

    await user.click(card);

    expect(onSelectPlant).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'plant-tomato' })
    );
  });
});
