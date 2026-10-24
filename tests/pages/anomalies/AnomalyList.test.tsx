import '@testing-library/jest-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnomalyList from '../../../src/pages/anomalies/AnomalyList';
import { getAnomalyList } from '../../../src/services/anomalies.service';
import { ApiError } from '../../../src/shared/errors/ApiError';
import type { AnomalyListItem } from '../../../src/types/Anomaly/Anomaly';
import type { PaginatedResponse } from '../../../src/types/api';
import {
  buildAnomalyListItem,
  buildDeletedAnomalyListItem
} from '../../fixtures/anomalies/buildAnomaly';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/anomalies.service', () => ({
  getAnomalyList: vi.fn()
}));

const mockedGetAnomalyList = vi.mocked(getAnomalyList);

function pageOf(
  data: AnomalyListItem[],
  pagination: Partial<PaginatedResponse<AnomalyListItem>['pagination']> = {}
): PaginatedResponse<AnomalyListItem> {
  return {
    data,
    pagination: {
      page: 1,
      limit: 25,
      totalPages: 1,
      totalItems: data.length,
      ...pagination
    }
  };
}

function renderList(route = '/anomalies') {
  return renderWithProviders(<AnomalyList />, { route, path: '/anomalies' });
}

const pulgon = buildAnomalyListItem();
const ortiga = buildAnomalyListItem({
  id: 'id-ortiga',
  slug: 'ortiga',
  name: 'Ortiga',
  scientificName: undefined,
  category: 'weed'
});

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetAnomalyList.mockResolvedValue(pageOf([pulgon, ortiga]));
});

describe('AnomalyList', () => {
  it('muestra el estado de carga', () => {
    mockedGetAnomalyList.mockReturnValue(new Promise(() => {}));

    renderList();

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('pinta nombre, nombre científico y categoría traducida de cada anomalía', async () => {
    renderList();

    const links = await screen.findAllByRole('link', { name: /Ver ficha de/ });

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/anomalies/pulgon-verde');
    expect(within(links[0]).getByText('Pulgón verde')).toBeInTheDocument();
    expect(within(links[0]).getByText('Myzus persicae')).toBeInTheDocument();
    expect(within(links[0]).getByText('Plaga')).toBeInTheDocument();
    expect(within(links[1]).getByText('Maleza')).toBeInTheDocument();
    expect(
      within(links[1]).getByText('Sin nombre científico')
    ).toBeInTheDocument();
  });

  it('no muestra badge de estado para anomalías activas', async () => {
    renderList();

    await screen.findAllByRole('link', { name: /Ver ficha de/ });

    expect(screen.queryByText('Eliminada')).not.toBeInTheDocument();
  });

  it('muestra el estado de error con reintento', async () => {
    mockedGetAnomalyList.mockRejectedValueOnce(new ApiError('boom', 500));
    const user = userEvent.setup();

    renderList();

    const retry = await screen.findByRole('button', { name: /reintentar/i });
    await user.click(retry);

    expect(
      await screen.findAllByRole('link', { name: /Ver ficha de/ })
    ).toHaveLength(2);
    expect(mockedGetAnomalyList).toHaveBeenCalledTimes(2);
  });

  it('muestra el estado vacío sin acción cuando no hay filtros ni paginación', async () => {
    mockedGetAnomalyList.mockResolvedValue(pageOf([], { totalPages: 0 }));

    renderList();

    expect(
      await screen.findByText('Aún no hay anomalías registradas.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Quitar filtros' })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Ir a la primera página' })
    ).toBeNull();
  });

  it('ofrece quitar filtros cuando el vacío viene de filtros activos', async () => {
    mockedGetAnomalyList.mockResolvedValue(pageOf([], { totalPages: 0 }));

    renderList('/anomalies?category=weed');

    expect(
      await screen.findByText('No hay anomalías que coincidan con los filtros.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Quitar filtros' })
    ).toBeInTheDocument();
  });

  it('ofrece volver a la primera página si la página pedida está vacía', async () => {
    mockedGetAnomalyList.mockResolvedValue(
      pageOf([], { page: 4, totalPages: 2, totalItems: 30 })
    );
    const user = userEvent.setup();

    renderList('/anomalies?page=4');

    await user.click(
      await screen.findByRole('button', { name: 'Ir a la primera página' })
    );

    expect(mockedGetAnomalyList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({ page: 1 })
      })
    );
  });

  it('pagina el listado y pide la página elegida', async () => {
    mockedGetAnomalyList.mockResolvedValue(
      pageOf([pulgon], { totalPages: 3, totalItems: 60 })
    );
    const user = userEvent.setup();

    renderList();

    const [firstNav] = await screen.findAllByRole('navigation', {
      name: 'Paginación'
    });
    await user.click(within(firstNav).getByRole('button', { name: '2' }));

    expect(mockedGetAnomalyList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({ page: 2 })
      })
    );
  });

  it('cambia el orden y vuelve a pedir el listado ordenado', async () => {
    const user = userEvent.setup();

    renderList();

    await screen.findAllByRole('link', { name: /Ver ficha de/ });
    await user.selectOptions(screen.getByLabelText('Ordenar por'), 'slug:desc');

    expect(mockedGetAnomalyList).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: { field: 'slug', direction: 'desc' } })
    );
  });

  it('cambia el tamaño de página', async () => {
    const user = userEvent.setup();

    renderList();

    await screen.findAllByRole('link', { name: /Ver ficha de/ });
    await user.click(screen.getByRole('button', { name: '50' }));

    expect(mockedGetAnomalyList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pagination: expect.objectContaining({ limit: 50 })
      })
    );
  });

  it('no filtra por estado en cliente: pinta lo que devuelve la API', async () => {
    mockedGetAnomalyList.mockResolvedValue(
      pageOf([buildDeletedAnomalyListItem()])
    );

    renderList();

    expect(await screen.findByText('Eliminada')).toBeInTheDocument();
  });
});
