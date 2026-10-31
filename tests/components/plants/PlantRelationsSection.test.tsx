import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlantRelationsSection from '../../../src/components/plants/PlantRelationsSection/PlantRelationsSection';
import { usePlantRelations } from '../../../src/pages/plants/hooks/usePlantRelations';
import { clearStoredToken } from '../../../src/shared/auth/session';
import { SectionErrorBoundary } from '../../../src/shared/components/SectionErrorBoundary/SectionErrorBoundary';
import {
  buildPaginatedPlantRelationsResponse,
  buildPlantRelation
} from '../../fixtures/plantRelations/buildPlantRelation';
import { createTestJwt } from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/pages/plants/hooks/usePlantRelations', () => ({
  usePlantRelations: vi.fn()
}));

const mockedUsePlantRelations = vi.mocked(usePlantRelations);
const CURRENT_PLANT_ID = '11111111-1111-4111-8111-111111111111';
const COMPANION_A_ID = '22222222-2222-4222-8222-222222222222';
const COMPANION_B_ID = '33333333-3333-4333-8333-333333333333';
const COMPANION_C_ID = '44444444-4444-4444-8444-444444444444';

describe('PlantRelationsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStoredToken();
  });

  it('renders loading indicator while query is pending', () => {
    mockedUsePlantRelations.mockReturnValue({
      isPending: true,
      data: undefined,
      isError: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderWithProviders(<PlantRelationsSection plantId={CURRENT_PLANT_ID} />);

    expect(screen.getByText('Cargando relaciones...')).toBeInTheDocument();
  });

  it('renders empty message when no relations are registered', () => {
    mockedUsePlantRelations.mockReturnValue({
      isPending: false,
      data: buildPaginatedPlantRelationsResponse([]),
      isError: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderWithProviders(<PlantRelationsSection plantId={CURRENT_PLANT_ID} />);

    expect(
      screen.getByText('No se han registrado asociaciones para esta planta')
    ).toBeInTheDocument();
  });

  it('renders categorized blocks for benefits received, benefits given, and incompatibilities', () => {
    const received = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: COMPANION_A_ID,
      targetPlantId: CURRENT_PLANT_ID,
      type: 'beneficial'
    });
    const given = buildPlantRelation({
      id: 'rel-2',
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_B_ID,
      type: 'beneficial'
    });
    const detrimental = buildPlantRelation({
      id: 'rel-3',
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_C_ID,
      type: 'detrimental'
    });

    mockedUsePlantRelations.mockReturnValue({
      isPending: false,
      data: buildPaginatedPlantRelationsResponse([
        received,
        given,
        detrimental
      ]),
      isError: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderWithProviders(<PlantRelationsSection plantId={CURRENT_PLANT_ID} />);

    expect(screen.getByText('Plantas que la benefician')).toBeInTheDocument();
    expect(screen.getByText('Plantas a las que beneficia')).toBeInTheDocument();
    expect(
      screen.getByText('Incompatibilidades (evitar cerca)')
    ).toBeInTheDocument();
  });

  it('renders explorer link pointing to dedicated relations viewer', () => {
    mockedUsePlantRelations.mockReturnValue({
      isPending: false,
      data: buildPaginatedPlantRelationsResponse([]),
      isError: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderWithProviders(<PlantRelationsSection plantId={CURRENT_PLANT_ID} />);

    const explorerLink = screen.getByRole('link', {
      name: /Explorar en el visor/
    });
    expect(explorerLink).toHaveAttribute(
      'href',
      `/plant-relations?plantId=${CURRENT_PLANT_ID}`
    );
  });

  it('isolates rendering failures hermetically inside SectionErrorBoundary', () => {
    mockedUsePlantRelations.mockImplementation(() => {
      throw new Error('Explosion');
    });

    renderWithProviders(
      <SectionErrorBoundary section="plant.relations">
        <PlantRelationsSection plantId={CURRENT_PLANT_ID} />
      </SectionErrorBoundary>
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'No se ha podido mostrar esta sección.'
    );
  });

  it('renders add relation button and card actions when user is admin', () => {
    const relation = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_A_ID,
      type: 'beneficial'
    });
    mockedUsePlantRelations.mockReturnValue({
      isPending: false,
      data: buildPaginatedPlantRelationsResponse([relation]),
      isError: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderWithProviders(<PlantRelationsSection plantId={CURRENT_PLANT_ID} />, {
      initialToken: createTestJwt({ roles: ['admin'] })
    });

    expect(
      screen.getByRole('button', { name: 'Añadir relación' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Editar relación/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Eliminar relación/ })
    ).toBeInTheDocument();
  });

  it('does not render curator actions when user is anonymous or regular user', () => {
    const relation = buildPlantRelation({
      id: 'rel-1',
      sourcePlantId: CURRENT_PLANT_ID,
      targetPlantId: COMPANION_A_ID,
      type: 'beneficial'
    });
    mockedUsePlantRelations.mockReturnValue({
      isPending: false,
      data: buildPaginatedPlantRelationsResponse([relation]),
      isError: false,
      error: null,
      refetch: vi.fn()
    } as unknown as ReturnType<typeof usePlantRelations>);

    renderWithProviders(<PlantRelationsSection plantId={CURRENT_PLANT_ID} />);

    expect(
      screen.queryByRole('button', { name: 'Añadir relación' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Editar relación/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Eliminar relación/ })
    ).not.toBeInTheDocument();
  });
});
