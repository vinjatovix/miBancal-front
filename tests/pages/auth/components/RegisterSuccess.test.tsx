import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import RegisterSuccess from '../../../../src/pages/auth/components/RegisterSuccess';

describe('RegisterSuccess', () => {
  it('renders confirmation heading and instructions to check email', () => {
    render(
      <MemoryRouter>
        <RegisterSuccess />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Revisa tu correo para activar la cuenta'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Hemos enviado un enlace de activación a tu dirección de correo electrónico.'
      )
    ).toBeInTheDocument();
  });

  it('renders link pointing to login page', () => {
    render(
      <MemoryRouter>
        <RegisterSuccess />
      </MemoryRouter>
    );

    const loginLink = screen.getByRole('link', {
      name: /¿Ya tienes cuenta\? Inicia sesión/i
    });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
