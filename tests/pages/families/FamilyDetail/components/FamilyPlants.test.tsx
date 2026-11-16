import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';

import FamilyPlants, {
  type FamilyPlantsQuery
} from '../../../../../src/pages/families/FamilyDetail/components/FamilyPlants';
import { listFamiliesResponse } from '../../../../fixtures/families/listFamilies';
import { buildFamilyPlantItem } from '../../../../fixtures/plants/buildFamilyPlantItem';
import { listPlantsResponse } from '../../../../fixtures/plants/listPlants';
import type { FamilyPlantItem } from '../../../../../src/types/Plants/Plant';

const mockFamily = listFamiliesResponse.data[0];
const mockPlants = listPlantsResponse.data.map(({ id, identity }) =>
  buildFamilyPlantItem({ id, identity })
);

function loadedQuery(
  plants: FamilyPlantItem[],
  total = plants.length
): FamilyPlantsQuery {
  return {
    data: {
      data: plants,
      pagination: { page: 1, limit: 25, totalPages: 1, totalItems: total }
    },
    error: null,
    isError: false,
    isFetching: false,
    refetch: vi.fn()
  };
}

function renderFamilyPlants(props: {
  family?: typeof mockFamily;
  plants?: FamilyPlantItem[];
  total?: number;
}) {
  return render(
    <MemoryRouter>
      <FamilyPlants
        family={props.family ?? mockFamily}
        query={loadedQuery(props.plants ?? mockPlants, props.total)}
      />
    </MemoryRouter>
  );
}

describe('FamilyPlants', () => {
  it.each([
    {
      plants: mockPlants.slice(0, 2),
      total: 10,
      expectedText: 'Mostrando 2 de 10 plantas'
    },
    {
      plants: [
        mockPlants[0],
        mockPlants[1],
        { ...mockPlants[0], id: '378efda2-ac3d-4623-81cd-fc1d0ab80316' }
      ],
      total: 3,
      expectedText: '3 plantas en total'
    },
    {
      plants: mockPlants.slice(0, 1),
      total: 1,
      expectedText: '1 planta en total'
    },
    {
      plants: mockPlants.slice(0, 2),
      total: 1,
      expectedText: '2 plantas en total'
    }
  ])(
    'displays count text "$expectedText" when total is $total',
    ({ plants, total, expectedText }) => {
      renderFamilyPlants({ plants, total });

      const countElement = screen.getByTestId('family-plants-count');

      expect(countElement).toHaveTextContent(expectedText);
    }
  );

  it('renders the plants count as total when no total is given', () => {
    const plants = mockPlants.slice(0, 2);

    renderFamilyPlants({ plants, total: undefined });

    const countElement = screen.getByTestId('family-plants-count');

    expect(countElement).toHaveTextContent('2 plantas en total');
  });

  it('renders count when total is 0 but plants are provided', () => {
    const plants = mockPlants.slice(0, 2);

    renderFamilyPlants({ plants, total: 0 });

    const countElement = screen.getByTestId('family-plants-count');

    expect(countElement).toHaveTextContent('2 plantas en total');
  });

  it('does not render empty state when total is 0 but plants are provided', () => {
    const plants = mockPlants.slice(0, 2);

    renderFamilyPlants({ plants, total: 0 });

    const emptyElement = screen.queryByTestId('family-plants-empty');

    expect(emptyElement).not.toBeInTheDocument();
  });

  it('renders empty state message when total is 0', () => {
    renderFamilyPlants({ plants: [], total: 0 });

    const emptyElement = screen.getByTestId('family-plants-empty');

    expect(emptyElement).toHaveTextContent(
      'No hay plantas registradas para esta familia.'
    );
  });

  it('hides count indicator when total is 0', () => {
    renderFamilyPlants({ plants: [], total: 0 });

    const countElement = screen.queryByTestId('family-plants-count');

    expect(countElement).not.toBeInTheDocument();
  });

  it('hides CTA link when total is 0', () => {
    renderFamilyPlants({ plants: [], total: 0 });

    const ctaLink = screen.queryByTestId('family-plants-view-all');

    expect(ctaLink).not.toBeInTheDocument();
  });

  it('hides plant grid when total is 0', () => {
    renderFamilyPlants({ plants: [], total: 0 });

    const plantLinks = screen.queryAllByTestId('family-plants-link');

    expect(plantLinks).toHaveLength(0);
  });

  it('renders CTA link with prefiltered family filter when total is greater than 0', () => {
    renderFamilyPlants({ plants: mockPlants.slice(0, 2), total: 2 });

    const ctaLink = screen.getByTestId('family-plants-view-all');

    expect(ctaLink).toHaveAttribute('href', `/plants?family=${mockFamily.id}`);
  });

  it('renders a link for each plant provided', () => {
    const plants = mockPlants.slice(0, 2);

    renderFamilyPlants({ plants, total: 2 });

    const plantLinks = screen.getAllByTestId('family-plants-link');

    expect(plantLinks).toHaveLength(2);
  });

  it('renders plant link with href pointing to plant detail', () => {
    const plants = mockPlants.slice(0, 2);

    renderFamilyPlants({ plants, total: 2 });

    const plantLinks = screen.getAllByTestId('family-plants-link');

    expect(plantLinks[0]).toHaveAttribute('href', `/plants/${plants[0].id}`);
  });

  it('renders plant links with capitalized primary names', () => {
    const plants = mockPlants.slice(0, 2);

    renderFamilyPlants({ plants, total: 2 });

    const plantLinks = screen.getAllByTestId('family-plants-link');

    expect(plantLinks[0]).toHaveTextContent('Perejil');
  });

  it('marks a deleted plant inside its link', () => {
    const plants = [
      mockPlants[0],
      buildFamilyPlantItem({ ...mockPlants[1], status: 'DELETED' })
    ];

    renderFamilyPlants({ plants, total: 2 });

    const plantLinks = screen.getAllByTestId('family-plants-link');

    expect(plantLinks[1]).toHaveTextContent('Borrada');
    expect(plantLinks[0]).not.toHaveTextContent('Borrada');
  });

  it('does not mark active plants or plants without status', () => {
    const plants = [
      mockPlants[0],
      buildFamilyPlantItem({ ...mockPlants[1], status: undefined })
    ];

    renderFamilyPlants({ plants, total: 2 });

    expect(screen.queryByText('Borrada')).not.toBeInTheDocument();
  });

  it('keeps the count when a plant is deleted', () => {
    const plants = [
      mockPlants[0],
      buildFamilyPlantItem({ ...mockPlants[1], status: 'DELETED' })
    ];

    renderFamilyPlants({ plants, total: 10 });

    expect(screen.getByTestId('family-plants-count')).toHaveTextContent(
      'Mostrando 2 de 10 plantas'
    );
  });
});
