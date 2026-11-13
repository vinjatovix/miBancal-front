import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { t } from '../../../src/i18n/core/t';
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
      route: '/anomalies?category=disorder',
      path: '/anomalies'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });
    await user.click(screen.getByRole('button', { name: /Limpiar filtros/ }));

    expect(mockedGetAnomalyList).toHaveBeenLastCalledWith(
      expect.objectContaining({ filters: {} })
    );
  });

  it('renders desktop persistent sidebar with complementary landmark in desktop view', async () => {
    renderWithProviders(<AnomaliesPage />, {
      route: '/anomalies',
      path: '/anomalies'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(
      screen.getByRole('complementary', { name: t('common.filters') })
    ).toBeInTheDocument();
  });

  it('does not render mobile filter button in desktop view', async () => {
    renderWithProviders(<AnomaliesPage />, {
      route: '/anomalies',
      path: '/anomalies'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(
      screen.queryByRole('button', { name: t('common.filters') })
    ).not.toBeInTheDocument();
  });

  it('renders mobile filter action button in mobile view', async () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }) as unknown as MediaQueryList
    );

    renderWithProviders(<AnomaliesPage />, {
      route: '/anomalies',
      path: '/anomalies'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(
      screen.getByRole('button', { name: t('common.filters') })
    ).toBeInTheDocument();
  });

  it('renders active filter badge in mobile view when category filter is active', async () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }) as unknown as MediaQueryList
    );

    renderWithProviders(<AnomaliesPage />, {
      route: '/anomalies?category=disease',
      path: '/anomalies'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    const badge = screen.getByTestId('catalog-fab-badge');
    expect(badge).toHaveTextContent('1');
  });

  it('does not render active filter badge in mobile view when no filters are active', async () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: true,
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn()
        }) as unknown as MediaQueryList
    );

    renderWithProviders(<AnomaliesPage />, {
      route: '/anomalies',
      path: '/anomalies'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(screen.queryByTestId('catalog-fab-badge')).not.toBeInTheDocument();
  });

  it('renders content container without exposing a duplicate main landmark', async () => {
    renderWithProviders(<AnomaliesPage />, {
      route: '/anomalies',
      path: '/anomalies'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
