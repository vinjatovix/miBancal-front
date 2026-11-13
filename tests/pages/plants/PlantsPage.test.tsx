import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { t } from '../../../src/i18n/core/t';
import PlantsPage from '../../../src/pages/plants/PlantsPage';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

let isMobile = true;

vi.mock('../../../src/shared/hooks/useMediaQuery', () => ({
  default: () => isMobile
}));

vi.mock('../../../src/pages/plants/hooks/usePlants', () => ({
  usePlants: () => ({
    query: {
      isError: false,
      isFetching: false,
      error: null,
      data: {
        data: [],
        pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
      }
    },
    request: {
      filters: {},
      pagination: { page: 1, limit: 25 },
      sort: { field: 'name', direction: 'asc' }
    },
    hasActiveFilters: false,
    setPage: vi.fn(),
    goToFirstPage: vi.fn(),
    clearFilters: vi.fn(),
    setLimit: vi.fn(),
    setSortField: vi.fn(),
    setSortDirection: vi.fn()
  })
}));

function renderPlantsPage() {
  return renderWithProviders(<PlantsPage />);
}

describe('PlantsPage', () => {
  beforeEach(() => {
    isMobile = true;
    document.body.style.overflow = '';
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('should always render plant list', () => {
    renderPlantsPage();
    expect(
      screen.getByRole('heading', { level: 1, name: t('plant.plants') })
    ).toBeInTheDocument();
  });

  it('should show filters button in mobile', () => {
    renderPlantsPage();
    expect(
      screen.getByRole('button', { name: /^filtros$/i })
    ).toBeInTheDocument();
  });

  it('should NOT show filters button in desktop', () => {
    isMobile = false;
    renderPlantsPage();

    expect(
      screen.queryByRole('button', { name: /^filtros$/i })
    ).not.toBeInTheDocument();
  });

  it('should open drawer when clicking filters button', async () => {
    const user = userEvent.setup();
    renderPlantsPage();

    await user.click(screen.getByRole('button', { name: /^filtros$/i }));

    expect(document.querySelector('.drawer-overlay')).toBeInTheDocument();
  });

  it('should not show drawer initially in mobile', () => {
    renderPlantsPage();

    expect(document.querySelector('.drawer-overlay')).not.toBeInTheDocument();
  });

  it('should not render sidebar in mobile mode', () => {
    renderPlantsPage();

    expect(
      screen.queryByRole('complementary', { name: t('common.filters') })
    ).not.toBeInTheDocument();
  });

  it('renders plants-main without exposing a main landmark to prevent duplicates', () => {
    renderPlantsPage();

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('renders plants sidebar in desktop mode', () => {
    isMobile = false;
    renderPlantsPage();

    expect(
      screen.getByRole('complementary', { name: t('common.filters') })
    ).toBeInTheDocument();
  });

  it('locks body scroll when drawer opens', async () => {
    const user = userEvent.setup();
    renderPlantsPage();

    await user.click(screen.getByRole('button', { name: t('common.filters') }));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body scroll when drawer closes', async () => {
    const user = userEvent.setup();
    renderPlantsPage();
    await user.click(screen.getByRole('button', { name: t('common.filters') }));

    await user.click(
      screen.getByRole('button', { name: t('common.drawer.close') })
    );

    expect(document.body.style.overflow).toBe('');
  });
});
