import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import OfflinePage from '../../src/pages/OfflinePage';
import { renderWithProviders } from '../test-utils/renderWithProviders';

describe('OfflinePage', () => {
  it('renders offline title heading', () => {
    renderWithProviders(<OfflinePage />, { route: '/offline' });

    const heading = screen.getByRole('heading', {
      level: 1,
      name: 'Sin conexión'
    });

    expect(heading).toBeInTheDocument();
  });

  it('renders offline status message', () => {
    renderWithProviders(<OfflinePage />, { route: '/offline' });

    const statusMessage = screen.getByRole('status');

    expect(statusMessage).toHaveTextContent(
      'Esta página no está disponible sin conexión a internet.'
    );
  });

  it('renders link back to plants catalog', () => {
    renderWithProviders(<OfflinePage />, { route: '/offline' });

    const link = screen.getByRole('link', { name: 'Volver al catálogo' });

    expect(link).toHaveAttribute('href', '/plants');
  });
});
