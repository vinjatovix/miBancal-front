import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlantRelationsPage from '../../../src/pages/plantRelations/PlantRelationsPage';
import { usePlant } from '../../../src/pages/plants/hooks/usePlant';
import { usePlantRelations } from '../../../src/pages/plants/hooks/usePlantRelations';
import { usePlantSearch } from '../../../src/pages/plantRelations/hooks/usePlantSearch';
import { listPlantsResponse } from '../../fixtures/plants/listPlants';
import { clearStoredToken } from '../../../src/shared/auth/session';
import { createTestJwt } from '../../fixtures/auth/authFixtures';
import {
  buildPaginatedPlantRelationsResponse,
  buildPlantRelation
} from '../../fixtures/plantRelations/buildPlantRelation';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/pages/plants/hooks/usePlant', () => ({
  usePlant: vi.fn()
}));
vi.mock('../../../src/pages/plants/hooks/usePlantRelations', () => ({
  usePlantRelations: vi.fn()
}));
vi.mock('../../../src/pages/plantRelations/hooks/usePlantSearch', () => ({
  usePlantSearch: vi.fn()
}));

const mockedUsePlant = vi.mocked(usePlant);
const mockedUsePlantRelations = vi.mocked(usePlantRelations);
const mockedUsePlantSearch = vi.mocked(usePlantSearch);

const mockPlant = listPlantsResponse.data[0];
const PLANT_ID = mockPlant.id;
const COMPANION_ID = '22222222-2222-4222-8222-222222222222';
const COMPANION_B_ID = '33333333-3333-4333-8333-333333333333';

function renderPage(initialRoute = '/plant-relations') {
  return renderWithProviders(<PlantRelationsPage />, {
    route: initialRoute,
    path: '/plant-relations'
  });
}

describe('PlantRelationsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStoredToken();
    mockedUsePlant.mockReturnValue({
      data: mockPlant,
      isLoading: false
    } as unknown as ReturnType<typeof usePlant>);
    mockedUsePlantSearch.mockReturnValue({
      data: undefined,
      isLoading: false
    } as unknown as ReturnType<typeof usePlantSearch>);
    mockedUsePlantRelations.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: false,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);
  });

  it('renders page header title as level 1 heading', () => {
    renderPage('/plant-relations');

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Explorador de relaciones entre plantas'
    });

    expect(heading).toHaveClass('plant-relations-page__title');
  });

  it('renders initial prompt when no plant is selected in URL', () => {
    renderPage('/plant-relations');

    expect(
      screen.getByRole('heading', { name: 'Explora asociaciones en el huerto' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Selecciona o busca una planta para explorar sus relaciones y asociaciones ecológicas'
      )
    ).toBeInTheDocument();
  });

  it('renders focal plant bar with name and scientific name when plant is selected', () => {
    mockedUsePlantRelations.mockReturnValue({
      data: buildPaginatedPlantRelationsResponse([]),
      isPending: false,
      isError: false,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderPage(`/plant-relations?plantId=${PLANT_ID}`);

    const focalBar = screen.getByRole('complementary', {
      name: 'Planta de origen'
    });
    expect(focalBar).toBeInTheDocument();
    expect(screen.getByText('Perejil')).toBeInTheDocument();
    expect(screen.getByText('petroselinum crispum')).toBeInTheDocument();
  });

  it('does not render focal plant bar when no plant is selected', () => {
    renderPage('/plant-relations');

    const focalBar = screen.queryByRole('complementary', {
      name: 'Planta de origen'
    });
    expect(focalBar).not.toBeInTheDocument();
  });

  it('renders relation cards and tabs when plantId is present in URL', () => {
    const beneficialRelation = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: PLANT_ID,
      targetPlantId: COMPANION_ID,
      type: 'beneficial'
    });
    const detrimentalRelation = buildPlantRelation({
      id: 'rel-2',
      sourcePlantId: COMPANION_B_ID,
      targetPlantId: PLANT_ID,
      type: 'detrimental'
    });

    mockedUsePlantRelations.mockReturnValue({
      data: buildPaginatedPlantRelationsResponse([
        beneficialRelation,
        detrimentalRelation
      ]),
      isPending: false,
      isError: false,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderPage(`/plant-relations?plantId=${PLANT_ID}`);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Todas (2)' })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Beneficiosas (1)' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: 'Perjudiciales (1)' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  it('groups multiple relations with the same companion into a single card', () => {
    const beneficialRelation = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: PLANT_ID,
      targetPlantId: COMPANION_ID,
      type: 'beneficial'
    });
    const detrimentalRelation = buildPlantRelation({
      id: 'rel-2',
      sourcePlantId: COMPANION_ID,
      targetPlantId: PLANT_ID,
      type: 'detrimental'
    });

    mockedUsePlantRelations.mockReturnValue({
      data: buildPaginatedPlantRelationsResponse([
        beneficialRelation,
        detrimentalRelation
      ]),
      isPending: false,
      isError: false,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderPage(`/plant-relations?plantId=${PLANT_ID}`);

    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByText(/Aporta/)).toBeInTheDocument();
    expect(screen.getByText(/Perjudica/)).toBeInTheDocument();
  });

  it('filters cards by tab selection', async () => {
    const beneficialRelation = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: PLANT_ID,
      targetPlantId: COMPANION_ID,
      type: 'beneficial'
    });
    const detrimentalRelation = buildPlantRelation({
      id: 'rel-2',
      sourcePlantId: COMPANION_ID,
      targetPlantId: PLANT_ID,
      type: 'detrimental'
    });

    mockedUsePlantRelations.mockReturnValue({
      data: buildPaginatedPlantRelationsResponse([
        beneficialRelation,
        detrimentalRelation
      ]),
      isPending: false,
      isError: false,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    const user = userEvent.setup();
    renderPage(`/plant-relations?plantId=${PLANT_ID}`);

    const beneficialTab = screen.getByRole('tab', {
      name: 'Beneficiosas (1)'
    });
    await user.click(beneficialTab);

    expect(beneficialTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });

  it('renders empty filter state when no relations match selected tab', () => {
    const beneficialRelation = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: PLANT_ID,
      targetPlantId: COMPANION_ID,
      type: 'beneficial'
    });

    mockedUsePlantRelations.mockReturnValue({
      data: buildPaginatedPlantRelationsResponse([beneficialRelation]),
      isPending: false,
      isError: false,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderPage(`/plant-relations?plantId=${PLANT_ID}&type=detrimental`);

    expect(
      screen.getByText(
        'No hay relaciones que coincidan con el filtro seleccionado'
      )
    ).toBeInTheDocument();
  });

  it('renders add relation button when user is admin and plant is selected', () => {
    mockedUsePlantRelations.mockReturnValue({
      data: buildPaginatedPlantRelationsResponse([]),
      isPending: false,
      isError: false,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderWithProviders(<PlantRelationsPage />, {
      route: `/plant-relations?plantId=${PLANT_ID}`,
      path: '/plant-relations',
      initialToken: createTestJwt({ roles: ['admin'] })
    });

    expect(
      screen.getByRole('button', { name: 'Añadir relación' })
    ).toBeInTheDocument();
  });

  it('does not render add relation button when user is regular user', () => {
    mockedUsePlantRelations.mockReturnValue({
      data: buildPaginatedPlantRelationsResponse([]),
      isPending: false,
      isError: false,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderPage(`/plant-relations?plantId=${PLANT_ID}`);

    expect(
      screen.queryByRole('button', { name: 'Añadir relación' })
    ).not.toBeInTheDocument();
  });

  it('renders sort select control with default name:asc option', () => {
    renderPage('/plant-relations');

    const sortSelect = screen.getByLabelText('Ordenar');

    expect(sortSelect).toBeInTheDocument();
    expect(sortSelect).toHaveValue('name:asc');
  });

  it('sorts companion cards according to selected sort option', async () => {
    const relationZanahoria = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: PLANT_ID,
      targetPlantId: COMPANION_ID,
      targetPlant: {
        id: COMPANION_ID,
        slug: 'zanahoria',
        name: { primary: 'Zanahoria' },
        scientificName: 'Daucus carota'
      }
    });
    const relationAlbahaca = buildPlantRelation({
      id: 'rel-2',
      sourcePlantId: PLANT_ID,
      targetPlantId: COMPANION_B_ID,
      targetPlant: {
        id: COMPANION_B_ID,
        slug: 'albahaca',
        name: { primary: 'Albahaca' },
        scientificName: 'Ocimum basilicum'
      }
    });

    mockedUsePlantRelations.mockReturnValue({
      data: buildPaginatedPlantRelationsResponse([
        relationZanahoria,
        relationAlbahaca
      ]),
      isPending: false,
      isError: false,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    const user = userEvent.setup();
    renderPage(`/plant-relations?plantId=${PLANT_ID}`);

    const articlesInitial = screen.getAllByRole('article');
    expect(articlesInitial[0]).toHaveTextContent('Albahaca');
    expect(articlesInitial[1]).toHaveTextContent('Zanahoria');

    const sortSelect = screen.getByLabelText('Ordenar');
    await user.selectOptions(sortSelect, 'name:desc');

    const articlesAfterSort = screen.getAllByRole('article');
    expect(articlesAfterSort[0]).toHaveTextContent('Zanahoria');
    expect(articlesAfterSort[1]).toHaveTextContent('Albahaca');
  });
});
