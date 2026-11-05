import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import AppBottomNav from '../../../src/components/layout/AppBottomNav/AppBottomNav';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('AppBottomNav', () => {
  it('renders navigation landmark with accessible label for bottom nav', () => {
    renderWithProviders(<AppBottomNav />);

    const nav = screen.getByRole('navigation', {
      name: 'Navegación inferior'
    });

    expect(nav).toBeInTheDocument();
  });

  it('renders navigation links for all items with stacked icon and label', () => {
    renderWithProviders(<AppBottomNav />);

    const plantsLink = screen.getByRole('link', { name: /Plantas/i });
    const familiesLink = screen.getByRole('link', { name: /Familias/i });

    expect(plantsLink).toHaveAttribute('href', '/plants');
    expect(familiesLink).toHaveAttribute('href', '/families');
  });

  it('does not render home link in bottom nav', () => {
    renderWithProviders(<AppBottomNav />);

    const homeLink = screen.queryByRole('link', { name: /Inicio/i });

    expect(homeLink).toBeNull();
  });

  it.each([
    ['/plants', 'Plantas', true],
    ['/plants/p-1', 'Plantas', true],
    ['/plants/crear', 'Plantas', true],
    ['/families', 'Plantas', false],
    ['/', 'Plantas', false],
    ['/settings', 'Plantas', false],
    ['/families', 'Familias', true],
    ['/families/f-2', 'Familias', true],
    ['/plants', 'Familias', false],
    ['/', 'Familias', false]
  ] as const)(
    'sets aria-current on %s for %s link to %s',
    (route, linkName, shouldBeActive) => {
      renderWithProviders(<AppBottomNav />, { route });

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

  it('navigates when clicking an inactive link', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppBottomNav />, { route: '/' });

    const familiesLink = screen.getByRole('link', { name: /Familias/i });
    await user.click(familiesLink);

    expect(familiesLink).toHaveAttribute('aria-current', 'page');
  });
});
