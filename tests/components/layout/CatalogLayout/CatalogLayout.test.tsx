import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import CatalogLayout from '../../../../src/components/layout/CatalogLayout/CatalogLayout';
import { t } from '../../../../src/i18n/core/t';

type MatchMediaListener = () => void;

interface ControllableMatchMedia {
  matches: boolean;
  media: string;
  addEventListener: (type: string, listener: MatchMediaListener) => void;
  removeEventListener: (type: string, listener: MatchMediaListener) => void;
  setMatches: (value: boolean) => void;
}

function createMatchMediaController(
  initialMatches: boolean
): ControllableMatchMedia {
  let listeners: MatchMediaListener[] = [];
  const state = { matches: initialMatches };

  const controller: ControllableMatchMedia = {
    get matches() {
      return state.matches;
    },
    media: '(max-width: 768px)',
    addEventListener: (_type: string, listener: MatchMediaListener) => {
      listeners.push(listener);
    },
    removeEventListener: (_type: string, listener: MatchMediaListener) => {
      listeners = listeners.filter((registered) => registered !== listener);
    },
    setMatches: (value: boolean) => {
      state.matches = value;
      listeners.forEach((listener) => listener());
    }
  };

  return controller;
}

describe('CatalogLayout', () => {
  let mediaController: ControllableMatchMedia;

  beforeEach(() => {
    mediaController = createMatchMediaController(true);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mediaController)
    );
    document.body.style.overflow = '';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.style.overflow = '';
  });

  it('renders mobile filter action button when drawer is closed in mobile view', () => {
    render(
      <CatalogLayout filters={<div>Filtros de prueba</div>}>
        <div>Contenido del catalogo</div>
      </CatalogLayout>
    );

    expect(
      screen.getByRole('button', { name: t('common.filters') })
    ).toBeInTheDocument();
  });

  it('renders custom filter label on mobile button when provided', () => {
    const customLabel = 'Filtrar plantas';

    render(
      <CatalogLayout filterLabel={customLabel} filters={<div>Filtros</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    expect(
      screen.getByRole('button', { name: customLabel })
    ).toBeInTheDocument();
  });

  it('does not render mobile count badge when activeCount is undefined', () => {
    render(
      <CatalogLayout filters={<div>Filtros</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    expect(screen.queryByTestId('catalog-fab-badge')).not.toBeInTheDocument();
  });

  it('does not render mobile count badge when activeCount is zero', () => {
    render(
      <CatalogLayout activeCount={0} filters={<div>Filtros</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    expect(screen.queryByTestId('catalog-fab-badge')).not.toBeInTheDocument();
  });

  it.each([1, 4, 12])(
    'renders count badge with %i when activeCount is greater than zero',
    (count) => {
      render(
        <CatalogLayout activeCount={count} filters={<div>Filtros</div>}>
          <div>Contenido</div>
        </CatalogLayout>
      );

      const badge = screen.getByTestId('catalog-fab-badge');
      expect(badge).toHaveTextContent(String(count));
    }
  );

  it('opens drawer and displays filters when mobile filter button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <CatalogLayout
        filters={<div data-testid="filter-content">Filtros Activos</div>}
      >
        <div>Contenido</div>
      </CatalogLayout>
    );

    await user.click(screen.getByRole('button', { name: t('common.filters') }));

    expect(screen.getByTestId('filter-content')).toBeInTheDocument();
  });

  it('hides mobile filter action button when drawer is opened', async () => {
    const user = userEvent.setup();

    render(
      <CatalogLayout filters={<div>Filtros</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    await user.click(screen.getByRole('button', { name: t('common.filters') }));

    expect(
      screen.queryByRole('button', { name: t('common.filters') })
    ).not.toBeInTheDocument();
  });

  it('restores mobile filter action button when drawer is closed', async () => {
    const user = userEvent.setup();

    render(
      <CatalogLayout filters={<div>Filtros</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    await user.click(screen.getByRole('button', { name: t('common.filters') }));
    await user.click(
      screen.getByRole('button', { name: t('common.drawer.close') })
    );

    expect(
      screen.getByRole('button', { name: t('common.filters') })
    ).toBeInTheDocument();
  });

  it('does not render desktop sidebar in mobile mode', () => {
    render(
      <CatalogLayout filters={<div>Filtros</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    expect(
      screen.queryByRole('complementary', { name: t('common.filters') })
    ).not.toBeInTheDocument();
  });

  it('renders catalog children safely when children is null', () => {
    const { container } = render(
      <CatalogLayout filters={<div>Filtros</div>}>{null}</CatalogLayout>
    );

    expect(
      container.querySelector('.catalog-layout__main')
    ).toBeInTheDocument();
  });

  it('appends custom className to root container when provided', () => {
    const { container } = render(
      <CatalogLayout
        className="custom-catalog-theme"
        filters={<div>Filtros</div>}
      >
        <div>Contenido</div>
      </CatalogLayout>
    );

    expect(container.firstElementChild).toHaveClass('custom-catalog-theme');
  });

  it('renders main content container without exposing a duplicate main landmark', () => {
    render(
      <CatalogLayout filters={<div>Filtros</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('renders desktop persistent aside sidebar with complementary landmark role in desktop view', () => {
    mediaController = createMatchMediaController(false);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mediaController)
    );

    render(
      <CatalogLayout filters={<div>Filtros de escritorio</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    expect(
      screen.getByRole('complementary', { name: t('common.filters') })
    ).toBeInTheDocument();
  });

  it('does not render mobile filter button in desktop view', () => {
    mediaController = createMatchMediaController(false);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mediaController)
    );

    render(
      <CatalogLayout filters={<div>Filtros</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    expect(
      screen.queryByRole('button', { name: t('common.filters') })
    ).not.toBeInTheDocument();
  });

  it('automatically closes mobile drawer when viewport resizes to desktop', async () => {
    const user = userEvent.setup();

    render(
      <CatalogLayout
        filters={<div data-testid="filter-content">Filtros Activos</div>}
      >
        <div>Contenido</div>
      </CatalogLayout>
    );

    await user.click(screen.getByRole('button', { name: t('common.filters') }));
    expect(screen.getByTestId('filter-content')).toBeInTheDocument();

    act(() => {
      mediaController.setMatches(false);
    });

    expect(document.querySelector('.drawer-overlay')).not.toBeInTheDocument();
  });

  it('restores body scroll when viewport resizes to desktop while drawer is open', async () => {
    const user = userEvent.setup();

    render(
      <CatalogLayout filters={<div>Filtros</div>}>
        <div>Contenido</div>
      </CatalogLayout>
    );

    await user.click(screen.getByRole('button', { name: t('common.filters') }));
    expect(document.body.style.overflow).toBe('hidden');

    act(() => {
      mediaController.setMatches(false);
    });

    expect(document.body.style.overflow).toBe('');
  });
});
