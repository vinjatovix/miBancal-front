import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import AnomalyDetail from '../../../src/pages/anomalies/AnomalyDetail/AnomalyDetail';
import AnomalyList from '../../../src/pages/anomalies/AnomalyList';
import {
  getAnomalyBySlug,
  getAnomalyForEdit,
  getAnomalyList
} from '../../../src/services/anomalies.service';
import { clearStoredToken } from '../../../src/shared/auth/session';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { anomalyKeys } from '../../../src/shared/reactQuery/anomalyKeys';
import {
  buildAnomalyListItem,
  buildDeletedAnomaly,
  buildDeletedAnomalyListItem
} from '../../fixtures/anomalies/buildAnomaly';
import {
  COLLABORATOR_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { createTestQueryClient } from '../../test-utils/createTestQueryClient';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/anomalies.service', () => ({
  getAnomalyList: vi.fn(),
  getAnomalyBySlug: vi.fn(),
  getAnomalyForEdit: vi.fn()
}));

const mockedGetAnomalyList = vi.mocked(getAnomalyList);
const mockedGetAnomalyBySlug = vi.mocked(getAnomalyBySlug);

const active = buildAnomalyListItem();
const deleted = buildDeletedAnomalyListItem({
  id: 'id-borrada',
  slug: 'borrada',
  name: 'Borrada'
});

function pageOf(...items: (typeof active)[]) {
  return {
    data: items,
    pagination: { page: 1, limit: 25, totalPages: 1, totalItems: items.length }
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  clearStoredToken();
  vi.mocked(getAnomalyForEdit).mockResolvedValue({
    anomaly: buildDeletedAnomaly(),
    etag: '"v1"'
  });
});

describe('visibilidad de anomalías eliminadas', () => {
  it('public list only receives and renders active ones', async () => {
    mockedGetAnomalyList.mockResolvedValue(pageOf(active));

    renderWithProviders(<AnomalyList />, { initialToken: VALID_TEST_TOKEN });

    await screen.findByRole('link', { name: /Ver ficha de Pulgón verde/ });

    expect(screen.queryByText('Eliminada')).not.toBeInTheDocument();
    expect(screen.queryByText('Borrada')).not.toBeInTheDocument();
  });

  it('editorial list renders deleted ones with status badge', async () => {
    mockedGetAnomalyList.mockResolvedValue(pageOf(active, deleted));

    renderWithProviders(<AnomalyList />, {
      initialToken: COLLABORATOR_TEST_TOKEN
    });

    const link = await screen.findByRole('link', {
      name: /Ver ficha de Borrada/
    });

    expect(link).toHaveTextContent('Eliminada');
    expect(screen.getAllByText('Eliminada')).toHaveLength(1);
  });

  it('la ficha de una eliminada responde "no encontrada" al público', async () => {
    mockedGetAnomalyBySlug.mockRejectedValue(new ApiError('not found', 404));

    renderWithProviders(
      <Routes>
        <Route path="/anomalies/:slug" element={<AnomalyDetail />} />
      </Routes>,
      { route: '/anomalies/borrada', initialToken: VALID_TEST_TOKEN }
    );

    expect(
      await screen.findByRole('heading', { name: 'Anomalía no encontrada' })
    ).toBeInTheDocument();
  });

  it('detail page of a deleted anomaly shows badge to an editor', async () => {
    mockedGetAnomalyBySlug.mockResolvedValue(buildDeletedAnomaly());

    renderWithProviders(
      <Routes>
        <Route path="/anomalies/:slug" element={<AnomalyDetail />} />
      </Routes>,
      {
        route: '/anomalies/pulgon-verde',
        initialToken: COLLABORATOR_TEST_TOKEN
      }
    );

    expect(await screen.findByText('Eliminada')).toBeInTheDocument();
  });

  it('no mezcla la caché pública y la editorial en el listado', async () => {
    const queryClient = createTestQueryClient();
    const request = {
      filters: {},
      pagination: { page: 1, limit: 25 },
      sort: { field: 'name', direction: 'asc' }
    } as const;
    queryClient.setQueryData(
      anomalyKeys.list(request, 'editorial'),
      pageOf(deleted)
    );
    mockedGetAnomalyList.mockResolvedValue(pageOf(active));

    renderWithProviders(<AnomalyList />, {
      queryClient,
      initialToken: VALID_TEST_TOKEN
    });

    await screen.findByRole('link', { name: /Ver ficha de Pulgón verde/ });

    expect(screen.queryByText('Eliminada')).not.toBeInTheDocument();
  });
});
