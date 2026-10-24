import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ResetPassword from '../../../src/pages/auth/ResetPassword/ResetPassword';
import * as authServiceModule from '../../../src/services/auth.service';
import { clearStoredToken } from '../../../src/shared/auth/session';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

function TestApp() {
  return (
    <Routes>
      <Route path="/" element={<div>Página principal</div>} />
      <Route path="/login" element={<div>Página de login</div>} />
      <Route path="/forgot-password" element={<div>Solicitar enlace</div>} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
}

function withToken(token = 'reset-token-value') {
  window.history.pushState(null, '', `/reset-password#token=${token}`);
}

async function fillPasswords(
  user: ReturnType<typeof userEvent.setup>,
  password: string,
  repeat = password
) {
  await user.type(screen.getByLabelText('Nueva contraseña'), password);
  await user.type(screen.getByLabelText('Repetir nueva contraseña'), repeat);
}

describe('ResetPassword Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    window.history.pushState(null, '', '/reset-password');
    vi.restoreAllMocks();
  });

  it('reads the token from the fragment at mount and sanitizes the URL', () => {
    withToken();
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/reset-password');
    expect(screen.getByLabelText('Nueva contraseña')).toBeInTheDocument();
  });

  it('shows the invalid link state without calling the API when the token is absent', () => {
    const resetSpy = vi.spyOn(authServiceModule, 'resetPassword');

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    expect(resetSpy).not.toHaveBeenCalled();
    expect(
      screen.getByRole('heading', { name: 'Enlace no válido o caducado' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Solicitar un enlace nuevo' })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText('Nueva contraseña')).toBeNull();
  });

  it('validates the password on client without calling the API', async () => {
    const user = userEvent.setup();
    withToken();
    const resetSpy = vi.spyOn(authServiceModule, 'resetPassword');

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    await fillPasswords(user, 'weak');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    );

    expect(resetSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial.'
      )
    ).toBeInTheDocument();
  });

  it('signals a mismatched repeat password without calling the API', async () => {
    const user = userEvent.setup();
    withToken();
    const resetSpy = vi.spyOn(authServiceModule, 'resetPassword');

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    await fillPasswords(user, 'Password123!', 'Different123!');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    );

    expect(resetSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText('Las contraseñas no coinciden')
    ).toBeInTheDocument();
  });

  it('shows the mismatch error in real time while typing without submitting', async () => {
    const user = userEvent.setup();
    withToken();
    const resetSpy = vi.spyOn(authServiceModule, 'resetPassword');

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    await fillPasswords(user, 'Password123!', 'Different123!');

    expect(
      await screen.findByText('Las contraseñas no coinciden')
    ).toBeInTheDocument();
    expect(resetSpy).not.toHaveBeenCalled();
  });

  it('confirms the reset on 204 showing success and a manual login link without a session', async () => {
    const user = userEvent.setup();
    withToken();
    const resetSpy = vi
      .spyOn(authServiceModule, 'resetPassword')
      .mockResolvedValueOnce(undefined);

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    await fillPasswords(user, 'Password123!');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    );

    expect(resetSpy).toHaveBeenCalledWith({
      token: 'reset-token-value',
      password: 'Password123!',
      repeatPassword: 'Password123!'
    });
    expect(
      await screen.findByText('Contraseña restablecida')
    ).toBeInTheDocument();
    const loginLink = screen.getByRole('link', { name: 'Ir a login' });
    expect(loginLink).toHaveAttribute('href', '/login');
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('maps a 400 with field errors to the corresponding fields', async () => {
    const user = userEvent.setup();
    withToken();
    vi.spyOn(authServiceModule, 'resetPassword').mockRejectedValueOnce(
      new ApiError('Validation', 400, { password: 'complexity' })
    );

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    await fillPasswords(user, 'Password123!');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    );

    expect(
      await screen.findByText(
        'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial.'
      )
    ).toBeInTheDocument();
  });

  it('shows the invalid link state on a uniform 400 after a valid password', async () => {
    const user = userEvent.setup();
    withToken('expired-token');
    vi.spyOn(authServiceModule, 'resetPassword').mockRejectedValueOnce(
      new ApiError('Invalid or expired token', 400)
    );

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    await fillPasswords(user, 'Password123!');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Enlace no válido o caducado'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Solicitar un enlace nuevo' })
    ).toBeInTheDocument();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('shows a rate limit notice on 429 keeping the form', async () => {
    const user = userEvent.setup();
    withToken();
    vi.spyOn(authServiceModule, 'resetPassword').mockRejectedValueOnce(
      new ApiError('Too Many Requests', 429)
    );

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    await fillPasswords(user, 'Password123!');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    );

    expect(
      await screen.findByText(
        'Demasiados intentos. Por favor, inténtalo más tarde.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    ).toBeInTheDocument();
  });

  it('prioritizes the password validation over an invalid token', async () => {
    const user = userEvent.setup();
    withToken('expired-token');
    const resetSpy = vi.spyOn(authServiceModule, 'resetPassword');

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    await fillPasswords(user, 'weak');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    );

    expect(resetSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial.'
      )
    ).toBeInTheDocument();
  });

  it('disables the submit button while the request is in flight', async () => {
    const user = userEvent.setup();
    withToken();
    let resolveRequest: (() => void) | undefined;
    vi.spyOn(authServiceModule, 'resetPassword').mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveRequest = resolve;
        })
    );

    renderWithProviders(<TestApp />, { route: '/reset-password' });

    await fillPasswords(user, 'Password123!');
    await user.click(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    );

    expect(
      screen.getByRole('button', { name: 'Confirmar contraseña' })
    ).toBeDisabled();

    resolveRequest?.();
    expect(
      await screen.findByText('Contraseña restablecida')
    ).toBeInTheDocument();
  });
});

describe('ResetPassword Page - password visibility toggle', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    window.history.pushState(null, '', '/reset-password');
    vi.restoreAllMocks();
  });

  it.each([
    ['password field', 'Nueva contraseña'],
    ['repeat password field', 'Repetir nueva contraseña']
  ])('renders %s initially masked with type password (C6)', (_, label) => {
    withToken();
    renderWithProviders(<TestApp />, { route: '/reset-password' });

    const input = screen.getByLabelText(label);

    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders two toggle buttons with accessible name Mostrar contraseña (C6)', () => {
    withToken();
    renderWithProviders(<TestApp />, { route: '/reset-password' });

    const toggleButtons = screen.getAllByRole('button', {
      name: 'Mostrar contraseña'
    });

    expect(toggleButtons).toHaveLength(2);
  });

  it.each([
    {
      target: 'password field',
      toggleIndex: 0,
      expectedPasswordType: 'text',
      expectedRepeatType: 'password'
    },
    {
      target: 'repeat password field',
      toggleIndex: 1,
      expectedPasswordType: 'password',
      expectedRepeatType: 'text'
    }
  ])(
    'toggles $target independently without affecting sibling field (C7)',
    async ({ toggleIndex, expectedPasswordType, expectedRepeatType }) => {
      const user = userEvent.setup();
      withToken();
      renderWithProviders(<TestApp />, { route: '/reset-password' });
      const passwordInput = screen.getByLabelText('Nueva contraseña');
      const repeatPasswordInput = screen.getByLabelText(
        'Repetir nueva contraseña'
      );
      await fillPasswords(user, 'NuevaClave123!');
      const toggleButtons = screen.getAllByRole('button', {
        name: 'Mostrar contraseña'
      });

      await user.click(toggleButtons[toggleIndex]);

      expect(passwordInput).toHaveAttribute('type', expectedPasswordType);
      expect(repeatPasswordInput).toHaveAttribute('type', expectedRepeatType);
    }
  );
});
