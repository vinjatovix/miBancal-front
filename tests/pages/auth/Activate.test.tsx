import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Activate from '../../../src/pages/auth/Activate';
import * as authServiceModule from '../../../src/services/auth.service';
import { clearStoredToken } from '../../../src/shared/auth/session';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

function TestApp() {
  return (
    <Routes>
      <Route path="/" element={<div>Página principal</div>} />
      <Route path="/login" element={<div>Página de login</div>} />
      <Route path="/activate" element={<Activate />} />
    </Routes>
  );
}

describe('Activate Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('displays invalid link error immediately when no token is in URL', () => {
    window.history.pushState(null, '', '/activate');

    renderWithProviders(<TestApp />, { route: '/activate' });

    expect(screen.getByText('Enlace no válido o caducado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Activar cuenta' })).toBeNull();
  });

  it('renders confirmation button without calling API automatically when token is present', () => {
    window.history.pushState(
      null,
      '',
      '/activate#token=activation-token-value'
    );
    const activateSpy = vi.spyOn(authServiceModule, 'activate');

    renderWithProviders(<TestApp />, { route: '/activate' });

    expect(activateSpy).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'Activar cuenta' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Pulsa el botón para confirmar la activación de tu cuenta.'
      )
    ).toBeInTheDocument();
  });

  it('activates account on button click and displays success confirmation', async () => {
    const user = userEvent.setup();
    window.history.pushState(
      null,
      '',
      '/activate#token=activation-token-value'
    );
    const activateSpy = vi
      .spyOn(authServiceModule, 'activate')
      .mockResolvedValueOnce(undefined);

    renderWithProviders(<TestApp />, { route: '/activate' });

    const activateButton = screen.getByRole('button', {
      name: 'Activar cuenta'
    });
    await user.click(activateButton);

    expect(activateSpy).toHaveBeenCalledWith({
      token: 'activation-token-value'
    });
    expect(await screen.findByText('Cuenta activada')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Iniciar sesión' })
    ).toBeInTheDocument();
  });

  it('shows error state when activation API returns error', async () => {
    const user = userEvent.setup();
    window.history.pushState(null, '', '/activate#token=invalid-token-value');
    vi.spyOn(authServiceModule, 'activate').mockRejectedValueOnce(
      new ApiError('Invalid or expired token', 400)
    );

    renderWithProviders(<TestApp />, { route: '/activate' });

    const activateButton = screen.getByRole('button', {
      name: 'Activar cuenta'
    });
    await user.click(activateButton);

    expect(
      await screen.findByText('Enlace no válido o caducado')
    ).toBeInTheDocument();
  });

  it('shows rate limit error message when activation API returns 429', async () => {
    const user = userEvent.setup();
    window.history.pushState(null, '', '/activate#token=some-token-value');
    vi.spyOn(authServiceModule, 'activate').mockRejectedValueOnce(
      new ApiError('Too Many Requests', 429)
    );

    renderWithProviders(<TestApp />, { route: '/activate' });

    const activateButton = screen.getByRole('button', {
      name: 'Activar cuenta'
    });
    await user.click(activateButton);

    expect(
      await screen.findByText(
        'Demasiados intentos. Por favor, inténtalo más tarde.'
      )
    ).toBeInTheDocument();
  });
});
