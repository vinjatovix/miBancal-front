import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import PlantCatalogSheet, {
  type PlantCatalogSheetItem
} from '../../../../../src/pages/locations/LocationLayoutPage/components/PlantCatalogSheet';

const plants: readonly PlantCatalogSheetItem[] = [
  { id: 'p1', commonName: 'Tomate', scientificName: 'Solanum lycopersicum' },
  { id: 'p2', commonName: 'Lechuga', scientificName: 'Lactuca sativa' },
  { id: 'p3', commonName: 'Albahaca', scientificName: 'Ocimum basilicum' }
];

function renderSheet(
  overrides: Partial<React.ComponentProps<typeof PlantCatalogSheet>> = {}
) {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  render(
    <PlantCatalogSheet
      isOpen
      plants={plants}
      onSelect={onSelect}
      onClose={onClose}
      {...overrides}
    />
  );
  return { onSelect, onClose };
}

describe('PlantCatalogSheet', () => {
  it('renders as a modal dialog titled with the catalog name', () => {
    renderSheet();
    const dialog = screen.getByRole('dialog', { name: 'Catálogo botánico' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('does not render anything when closed', () => {
    renderSheet({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('filters the plant list by the search query', async () => {
    const user = userEvent.setup();
    renderSheet();
    expect(screen.getByRole('button', { name: /Tomate/ })).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox'), 'lech');

    expect(
      screen.queryByRole('button', { name: /Tomate/ })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lechuga/ })).toBeInTheDocument();
  });

  it('filters the plant list by the scientific name', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.type(screen.getByRole('searchbox'), 'sativa');

    expect(screen.getByRole('button', { name: /Lechuga/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Tomate/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Albahaca/ })
    ).not.toBeInTheDocument();
  });

  it('shows an empty state when no plant matches the query', async () => {
    const user = userEvent.setup();
    renderSheet();
    await user.type(screen.getByRole('searchbox'), 'zzz');
    expect(
      screen.getByText('No se han encontrado plantas.')
    ).toBeInTheDocument();
  });

  it('selects a plant and closes automatically', async () => {
    const user = userEvent.setup();
    const { onSelect, onClose } = renderSheet();

    await user.click(screen.getByRole('button', { name: /Albahaca/ }));

    expect(onSelect).toHaveBeenCalledWith('p3');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when pressing Escape', async () => {
    const user = userEvent.setup();
    const { onClose } = renderSheet();

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
