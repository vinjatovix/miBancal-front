import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ForgotPassword from '../../../src/pages/auth/ForgotPassword/ForgotPassword';
import * as authServiceModule from '../../../src/services/auth.service';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

const UNIFORM_NOTICE =
  'Si existe una cuenta con ese correo, te hemos enviado un enlace para restablecer la contraseña.';

function TestApp() {
  return (
    <Routes>
      <Route path="/" element={<div>Página principal</div>} />
      <Route path="/login" element={<div>Página de login</div>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
}

describe('ForgotPassword Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('redirects to home when the user is already authenticated', () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(<TestApp />, { route: '/forgot-password' });

    expect(screen.getByText('Página principal')).toBeInTheDocument();
  });

  it('validates the email on client without calling the API', async () => {
    const user = userEvent.setup();
    const forgotSpy = vi.spyOn(authServiceModule, 'forgotPassword');

    renderWithProviders(<TestApp />, { route: '/forgot-password' });

    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(forgotSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Campo obligatorio')).toBeInTheDocument();

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'correo-invalido'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(forgotSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText('Introduce una dirección de correo válida')
    ).toBeInTheDocument();
  });

  it('replaces the form with the uniform notice after a 202 response', async () => {
    const user = userEvent.setup();
    const forgotSpy = vi
      .spyOn(authServiceModule, 'forgotPassword')
      .mockResolvedValueOnce(undefined);

    renderWithProviders(<TestApp />, { route: '/forgot-password' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(forgotSpy).toHaveBeenCalledWith({
      email: 'hortelano@example.com'
    });
    expect(await screen.findByText(UNIFORM_NOTICE)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enviar enlace' })).toBeNull();
  });

  it('shows the same uniform notice when the account does not exist', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'forgotPassword').mockResolvedValueOnce(
      undefined
    );

    renderWithProviders(<TestApp />, { route: '/forgot-password' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'desconocido@example.com'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByText(UNIFORM_NOTICE)).toBeInTheDocument();
  });

  it('shows a rate limit notice and keeps the form on 429', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'forgotPassword').mockRejectedValueOnce(
      new ApiError('Too Many Requests', 429)
    );

    renderWithProviders(<TestApp />, { route: '/forgot-password' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(
      await screen.findByText(
        'Demasiados intentos. Por favor, inténtalo más tarde.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enviar enlace' })
    ).toBeInTheDocument();
  });

  it('maps a 400 with email field error to the email field', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'forgotPassword').mockRejectedValueOnce(
      new ApiError('Validation', 400, { email: 'invalid' })
    );

    renderWithProviders(<TestApp />, { route: '/forgot-password' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(
      await screen.findByText('Introduce una dirección de correo válida')
    ).toBeInTheDocument();
    expect(screen.queryByText(UNIFORM_NOTICE)).toBeNull();
  });

  it('shows a retryable error on network failure without throwing in render', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'forgotPassword').mockRejectedValueOnce(
      new NetworkError('Network unreachable')
    );

    renderWithProviders(<TestApp />, { route: '/forgot-password' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar enlace' })).toBeEnabled();
  });

  it('disables the submit button while the request is in flight', async () => {
    const user = userEvent.setup();
    let resolveRequest: (() => void) | undefined;
    vi.spyOn(authServiceModule, 'forgotPassword').mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        })
    );

    renderWithProviders(<TestApp />, { route: '/forgot-password' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(
      screen.getByRole('button', { name: 'Enviar enlace' })
    ).toBeDisabled();

    resolveRequest?.();
    expect(await screen.findByText(UNIFORM_NOTICE)).toBeInTheDocument();
  });
});
