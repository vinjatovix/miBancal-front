import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AppBottomNav from '../../../src/components/layout/AppBottomNav/AppBottomNav';
import AppNavRail from '../../../src/components/layout/AppNavRail/AppNavRail';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('Navigation links for plant relations', () => {
  it('renders Relaciones link in AppNavRail with plant_relations icon and href', () => {
    renderWithProviders(<AppNavRail isExpanded={true} onToggle={vi.fn()} />);

    const link = screen.getByRole('link', { name: /Relaciones/i });

    expect(link).toHaveAttribute('href', '/plant-relations');
  });

  it('renders Relaciones link in AppBottomNav with href', () => {
    renderWithProviders(<AppBottomNav />);

    const link = screen.getByRole('link', { name: /Relaciones/i });

    expect(link).toHaveAttribute('href', '/plant-relations');
  });

  it.each([
    '/plant-relations',
    '/plant-relations?plantId=11111111-1111-4111-8111-111111111111'
  ])('sets aria-current on AppNavRail link when route is %s', (route) => {
    renderWithProviders(<AppNavRail isExpanded={true} onToggle={vi.fn()} />, {
      route
    });

    const link = screen.getByRole('link', { name: /Relaciones/i });

    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it.each([
    '/plant-relations',
    '/plant-relations?plantId=11111111-1111-4111-8111-111111111111'
  ])('sets aria-current on AppBottomNav link when route is %s', (route) => {
    renderWithProviders(<AppBottomNav />, {
      route
    });

    const link = screen.getByRole('link', { name: /Relaciones/i });

    expect(link).toHaveAttribute('aria-current', 'page');
  });
});
