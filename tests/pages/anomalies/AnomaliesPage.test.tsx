import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnomaliesPage from '../../../src/pages/anomalies/AnomaliesPage';
import { getAnomalyList } from '../../../src/services/anomalies.service';
import { buildAnomalyListItem } from '../../fixtures/anomalies/buildAnomaly';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/anomalies.service', () => ({
  getAnomalyList: vi.fn()
}));

const mockedGetAnomalyList = vi.mocked(getAnomalyList);

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetAnomalyList.mockResolvedValue({
    data: [buildAnomalyListItem()],
    pagination: { page: 1, limit: 25, totalPages: 1, totalItems: 1 }
  });
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      }) as unknown as MediaQueryList
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AnomaliesPage', () => {
  it('filtra por categoría y lo refleja en la petición reiniciando la página', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnomaliesPage />, {
      route: '/anomalies?page=3',
      path: '/anomalies'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });
    await user.selectOptions(screen.getByLabelText('Categoría'), 'disease');

    expect(mockedGetAnomalyList).toHaveBeenLastCalledWith({
      filters: { category: 'disease' },
      pagination: { page: 1, limit: 25 },
      sort: { field: 'name', direction: 'asc' }
    });
  });

  it('limpia los filtros y vuelve a pedir el listado sin ellos', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AnomaliesPage />, {
      route: '/anomalies?category=weed',
      path: '/anomalies'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });
    await user.click(screen.getByRole('button', { name: /Limpiar filtros/ }));

    expect(mockedGetAnomalyList).toHaveBeenLastCalledWith(
      expect.objectContaining({ filters: {} })
    );
  });
});
