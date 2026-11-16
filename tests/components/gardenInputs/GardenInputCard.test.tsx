import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import GardenInputCard from '../../../src/components/gardenInputs/GardenInputCard/GardenInputCard';
import {
  buildDeletedGardenInputListItem,
  buildGardenInputListItem
} from '../../fixtures/gardenInputs/gardenInputFixtures';

function renderCard(item = buildGardenInputListItem()) {
  return render(
    <MemoryRouter>
      <GardenInputCard gardenInput={item} />
    </MemoryRouter>
  );
}

describe('GardenInputCard', () => {
  it('renders card title with capitalized name', () => {
    const item = buildGardenInputListItem({ name: 'purín de ortiga' });

    renderCard(item);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Purín de ortiga');
  });

  it('renders link navigating to garden input slug with accessible label', () => {
    const item = buildGardenInputListItem({
      slug: 'purin-ortiga',
      name: 'Purín de ortiga'
    });

    renderCard(item);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/garden-inputs/purin-ortiga');
    expect(link).toHaveAttribute('aria-label', 'Ver ficha de Purín de ortiga');
  });

  it('renders category badge translated into Spanish', () => {
    const item = buildGardenInputListItem({ category: 'defense', actions: [] });

    renderCard(item);

    expect(screen.getByText('Defensa')).toBeInTheDocument();
  });

  it('renders action badges translated into Spanish', () => {
    const item = buildGardenInputListItem({
      actions: ['biostimulant', 'repellent']
    });

    renderCard(item);

    expect(screen.getByText('Bioestimulante')).toBeInTheDocument();
    expect(screen.getByText('Repelente')).toBeInTheDocument();
  });

  it('renders deleted status badge when item is soft-deleted', () => {
    const item = buildDeletedGardenInputListItem();

    renderCard(item);

    expect(screen.getByText('Eliminado')).toBeInTheDocument();
  });

  it('does not render deleted status badge when item is active', () => {
    const item = buildGardenInputListItem({ status: 'active' });

    renderCard(item);

    expect(screen.queryByText('Eliminado')).not.toBeInTheDocument();
  });

  it('renders description excerpt when available', () => {
    const item = buildGardenInputListItem({
      description: 'Extracto fermentado rico en minerales.'
    });

    renderCard(item);

    expect(
      screen.getByText('Extracto fermentado rico en minerales.')
    ).toBeInTheDocument();
  });
});
