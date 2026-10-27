import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { t } from '../../../src/i18n/core/t';
import GardenInputsPage from '../../../src/pages/gardenInputs/GardenInputsPage';
import { getGardenInputList } from '../../../src/services/gardenInputs.service';
import { buildGardenInputListItem } from '../../fixtures/gardenInputs/gardenInputFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

vi.mock('../../../src/services/gardenInputs.service', () => ({
  getGardenInputList: vi.fn()
}));

const mockedGetGardenInputList = vi.mocked(getGardenInputList);

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetGardenInputList.mockResolvedValue({
    data: [buildGardenInputListItem()],
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

describe('GardenInputsPage', () => {
  it('filters by category chip and resets page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs?page=3',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });
    const defenseChip = screen.getByRole('button', { name: 'Defensa' });
    await user.click(defenseChip);

    expect(mockedGetGardenInputList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ category: ['defense'] }),
        pagination: expect.objectContaining({ page: 1 })
      })
    );
  });

  it('filters by action chip and updates list query', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });
    const fungicideChip = screen.getByRole('button', { name: 'Fungicida' });
    await user.click(fungicideChip);

    expect(mockedGetGardenInputList).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ action: ['fungicide'] })
      })
    );
  });

  it('clears active filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs?category=defense',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });
    const clearButton = screen.getByRole('button', { name: /Limpiar filtros/ });
    await user.click(clearButton);

    expect(mockedGetGardenInputList).toHaveBeenLastCalledWith(
      expect.objectContaining({ filters: {} })
    );
  });

  it('renders desktop persistent sidebar with complementary landmark', async () => {
    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(
      screen.getByRole('complementary', { name: t('common.filters') })
    ).toBeInTheDocument();
  });

  it('renders mobile filter action button when in mobile view', async () => {
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

    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(
      screen.getByRole('button', { name: t('common.filters') })
    ).toBeInTheDocument();
  });

  it('renders active filter badge in mobile view when filters are applied', async () => {
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

    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs?category=defense',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    const badge = screen.getByTestId('catalog-fab-badge');
    expect(badge).toHaveTextContent('1');
  });

  it('does not render duplicate main landmark', async () => {
    renderWithProviders(<GardenInputsPage />, {
      route: '/garden-inputs',
      path: '/garden-inputs'
    });

    await screen.findByRole('link', { name: /Ver ficha de/ });

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });
});
