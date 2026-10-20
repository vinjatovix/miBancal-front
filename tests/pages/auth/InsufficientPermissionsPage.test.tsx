import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import InsufficientPermissionsPage from '../../../src/pages/auth/InsufficientPermissionsPage';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('InsufficientPermissionsPage', () => {
  it('renders heading, explanatory message, and navigation links', () => {
    renderWithProviders(<InsufficientPermissionsPage />);

    expect(
      screen.getByRole('heading', { name: 'Permisos insuficientes' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Se requiere rol de Colaborador o Administrador para crear o modificar fichas del catálogo botánico.'
      )
    ).toBeInTheDocument();

    const plantsLink = screen.getByRole('link', {
      name: 'Volver al catálogo de plantas'
    });
    expect(plantsLink).toHaveAttribute('href', '/plants');

    const familiesLink = screen.getByRole('link', {
      name: 'Volver al catálogo de familias'
    });
    expect(familiesLink).toHaveAttribute('href', '/families');
  });
});
