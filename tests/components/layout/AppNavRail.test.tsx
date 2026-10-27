import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import AppNavRail from '../../../src/components/layout/AppNavRail/AppNavRail';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('AppNavRail', () => {
  it('renders navigation landmark with accessible label', () => {
    renderWithProviders(<AppNavRail isExpanded={true} onToggle={vi.fn()} />);

    const nav = screen.getByRole('navigation', {
      name: 'Navegación principal'
    });

    expect(nav).toBeInTheDocument();
  });

  it('renders links for all navigation items', () => {
    renderWithProviders(<AppNavRail isExpanded={true} onToggle={vi.fn()} />);

    const plantsLink = screen.getByRole('link', { name: /Plantas/i });
    const familiesLink = screen.getByRole('link', { name: /Familias/i });

    expect(plantsLink).toHaveAttribute('href', '/plants');
    expect(familiesLink).toHaveAttribute('href', '/families');
  });

  it('does not render home link in rail', () => {
    renderWithProviders(<AppNavRail isExpanded={true} onToggle={vi.fn()} />);

    const homeLink = screen.queryByRole('link', { name: /Inicio/i });

    expect(homeLink).toBeNull();
  });

  it.each([
    ['/plants', 'Plantas', true],
    ['/plants/plant-123', 'Plantas', true],
    ['/plants/crear', 'Plantas', true],
    ['/families', 'Plantas', false],
    ['/', 'Plantas', false],
    ['/settings', 'Plantas', false],
    ['/families', 'Familias', true],
    ['/families/fam-456', 'Familias', true],
    ['/plants', 'Familias', false],
    ['/', 'Familias', false]
  ] as const)(
    'sets aria-current on %s for %s link to %s',
    (route, linkName, shouldBeActive) => {
      renderWithProviders(<AppNavRail isExpanded={true} onToggle={vi.fn()} />, {
        route
      });

      const link = screen.getByRole('link', {
        name: new RegExp(linkName, 'i')
      });

      if (shouldBeActive) {
        expect(link).toHaveAttribute('aria-current', 'page');
      } else {
        expect(link).not.toHaveAttribute('aria-current');
      }
    }
  );

  it('navigates to matching path when link is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppNavRail isExpanded={true} onToggle={vi.fn()} />, {
      route: '/'
    });

    const plantsLink = screen.getByRole('link', { name: /Plantas/i });
    await user.click(plantsLink);

    expect(plantsLink).toHaveAttribute('aria-current', 'page');
  });

  describe('toggle control and collapsed mode tooltips', () => {
    it('renders toggle button with expanded accessibility state and label', () => {
      renderWithProviders(<AppNavRail isExpanded={true} onToggle={vi.fn()} />);

      const toggleButton = screen.getByRole('button', {
        name: 'Contraer menú de navegación'
      });

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('renders toggle button with collapsed accessibility state and label', () => {
      renderWithProviders(<AppNavRail isExpanded={false} onToggle={vi.fn()} />);

      const toggleButton = screen.getByRole('button', {
        name: 'Expandir menú de navegación'
      });

      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('invokes onToggle callback when toggle button is clicked', async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      renderWithProviders(<AppNavRail isExpanded={true} onToggle={onToggle} />);

      const toggleButton = screen.getByRole('button', {
        name: 'Contraer menú de navegación'
      });
      await user.click(toggleButton);

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it('renders tooltip elements with role="tooltip" for items in collapsed mode', () => {
      renderWithProviders(<AppNavRail isExpanded={false} onToggle={vi.fn()} />);

      const tooltips = screen.getAllByRole('tooltip');

      expect(tooltips).toHaveLength(4);
      expect(tooltips[0]).toHaveTextContent('Plantas');
      expect(tooltips[1]).toHaveTextContent('Familias');
      expect(tooltips[2]).toHaveTextContent('Anomalías');
      expect(tooltips[3]).toHaveTextContent('Insumos');
    });

    it('does not render tooltip roles in expanded mode', () => {
      renderWithProviders(<AppNavRail isExpanded={true} onToggle={vi.fn()} />);

      const tooltips = screen.queryAllByRole('tooltip');

      expect(tooltips).toHaveLength(0);
    });
  });
});
