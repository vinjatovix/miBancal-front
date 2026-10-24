import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/config/env', () => ({
  GOOGLE_CLIENT_ID: 'test-client-id',
  GITHUB_CLIENT_ID: 'test-github-client-id'
}));
vi.mock('../../../src/shared/auth/googleSdk', () => ({
  loadGoogleSdk: vi.fn().mockResolvedValue(undefined)
}));

import Register from '../../../src/pages/auth/Register';
import * as authServiceModule from '../../../src/services/auth.service';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { ApiError } from '../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../src/shared/errors/NetworkError';
import { t } from '../../../src/i18n/core/t';
import { VALID_TEST_TOKEN } from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

function TestApp() {
  return (
    <Routes>
      <Route path="/" element={<div>Página principal</div>} />
      <Route path="/login" element={<div>Página de login</div>} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

describe('Register Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('redirects to home if user is already authenticated', () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(<TestApp />, { route: '/register' });

    expect(screen.getByText('Página principal')).toBeInTheDocument();
  });

  it('keeps submit button disabled when form fields are missing', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { route: '/register' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );

    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeDisabled();
  });

  it('enables submit button when all fields are valid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { route: '/register' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'hortelano');
    await user.type(screen.getByLabelText(/^Contraseña/i), 'Password123!');
    await user.type(
      screen.getByLabelText(/Repetir contraseña/i),
      'Password123!'
    );

    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled();
  });

  it.each([
    ['weak password', 'abc', 'Débil'],
    ['medium password', 'Password12', 'Media'],
    ['strong password', 'Password123!', 'Fuerte']
  ])(
    'displays %s strength indicator (%s)',
    async (_, passwordValue, expectedLabel) => {
      const user = userEvent.setup();
      renderWithProviders(<TestApp />, { route: '/register' });

      await user.type(screen.getByLabelText(/^Contraseña/i), passwordValue);

      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    }
  );

  it('displays static password requirements hint by default', () => {
    renderWithProviders(<TestApp />, { route: '/register' });

    const hint = screen.getByText(
      'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial.'
    );

    expect(hint).toHaveClass('auth-field-hint');
  });

  it('does not display redundant red error copy when password does not meet complexity', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { route: '/register' });
    const passwordInput = screen.getByLabelText(/^Contraseña/i);

    await user.type(passwordInput, 'WeakPass1');

    expect(
      screen.queryByText(
        'La contraseña debe tener entre 8 y 64 caracteres e incluir mayúscula, minúscula, número y carácter especial.',
        { selector: '.auth-error-text' }
      )
    ).not.toBeInTheDocument();
  });

  it.each([
    ['email', /Correo electrónico/i],
    ['username', /Nombre de usuario/i],
    ['password', /^Contraseña/i],
    ['repeat password', /Repetir contraseña/i]
  ])(
    'does not display Campo obligatorio on initial keystroke for %s',
    async (_, label) => {
      const user = userEvent.setup();
      renderWithProviders(<TestApp />, { route: '/register' });
      const input = screen.getByLabelText(label);

      await user.type(input, 'a');

      expect(screen.queryByText('Campo obligatorio')).not.toBeInTheDocument();
    }
  );

  it.each([
    ['email', /Correo electrónico/i],
    ['username', /Nombre de usuario/i],
    ['password', /^Contraseña/i],
    ['repeat password', /Repetir contraseña/i]
  ])(
    'displays Campo obligatorio when %s field has been typed into and then cleared',
    async (_, label) => {
      const user = userEvent.setup();
      renderWithProviders(<TestApp />, { route: '/register' });
      const input = screen.getByLabelText(label);
      await user.type(input, 'a');

      await user.clear(input);

      expect(await screen.findByText('Campo obligatorio')).toBeInTheDocument();
    }
  );

  it.each([
    ['email', /Correo electrónico/i],
    ['username', /Nombre de usuario/i],
    ['password', /^Contraseña/i],
    ['repeat password', /Repetir contraseña/i]
  ])(
    'displays Campo obligatorio when %s field is blurred while empty',
    async (_, label) => {
      const user = userEvent.setup();
      renderWithProviders(<TestApp />, { route: '/register' });
      const input = screen.getByLabelText(label);

      await user.click(input);
      await user.tab();

      expect(await screen.findByText('Campo obligatorio')).toBeInTheDocument();
    }
  );

  it('shows password mismatch error in real time when repeat password does not match', async () => {
    const user = userEvent.setup();

    renderWithProviders(<TestApp />, { route: '/register' });

    await user.type(screen.getByLabelText(/^Contraseña/i), 'Password123!');
    await user.type(
      screen.getByLabelText(/Repetir contraseña/i),
      'DifferentPass123!'
    );

    expect(
      await screen.findByText('Las contraseñas no coinciden')
    ).toBeInTheDocument();
  });

  it('submits valid registration and shows neutral confirmation message', async () => {
    const user = userEvent.setup();
    const registerSpy = vi
      .spyOn(authServiceModule, 'register')
      .mockResolvedValueOnce(undefined);

    renderWithProviders(<TestApp />, { route: '/register' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'hortelano');
    await user.type(screen.getByLabelText(/^Contraseña/i), 'Password123!');
    await user.type(
      screen.getByLabelText(/Repetir contraseña/i),
      'Password123!'
    );

    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(registerSpy).toHaveBeenCalledTimes(1);
    const dto = registerSpy.mock.calls[0][0];
    expect(dto.email).toBe('hortelano@example.com');
    expect(dto.username).toBe('hortelano');
    expect(dto.password).toBe('Password123!');
    expect(dto.repeatPassword).toBe('Password123!');
    expect(typeof dto.id).toBe('string');
    expect(dto.id.length).toBe(36);

    expect(
      await screen.findByText('Revisa tu correo para activar la cuenta')
    ).toBeInTheDocument();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
  });

  it('handles 409 conflict by marking username in use', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'register').mockRejectedValueOnce(
      new ApiError('Username already in use', 409)
    );

    renderWithProviders(<TestApp />, { route: '/register' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'hortelano');
    await user.type(screen.getByLabelText(/^Contraseña/i), 'Password123!');
    await user.type(
      screen.getByLabelText(/Repetir contraseña/i),
      'Password123!'
    );
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      await screen.findByText(
        'El nombre de usuario ya está en uso. Por favor, elige otro.'
      )
    ).toBeInTheDocument();
  });

  it('handles 429 rate limit error', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'register').mockRejectedValueOnce(
      new ApiError('Too many requests', 429)
    );

    renderWithProviders(<TestApp />, { route: '/register' });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'hortelano');
    await user.type(screen.getByLabelText(/^Contraseña/i), 'Password123!');
    await user.type(
      screen.getByLabelText(/Repetir contraseña/i),
      'Password123!'
    );
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    expect(
      await screen.findByText(
        'Demasiados intentos. Por favor, inténtalo más tarde.'
      )
    ).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    renderWithProviders(<TestApp />, { route: '/register' });

    const loginLink = screen.getByRole('link', {
      name: /¿Ya tienes cuenta\? Inicia sesión/i
    });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});

describe('Register Page - password visibility toggle', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it.each([
    ['password field', /^Contraseña/i],
    ['repeat password field', /Repetir contraseña/i]
  ])('renders %s initially masked with type password (C6)', (_, labelRegex) => {
    renderWithProviders(<TestApp />, { route: '/register' });

    const input = screen.getByLabelText(labelRegex);

    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders two toggle buttons with accessible name Mostrar contraseña (C6)', () => {
    renderWithProviders(<TestApp />, { route: '/register' });

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
      renderWithProviders(<TestApp />, { route: '/register' });
      const passwordInput = screen.getByLabelText(/^Contraseña/i);
      const repeatPasswordInput = screen.getByLabelText(/Repetir contraseña/i);
      await user.type(passwordInput, 'Clave123!A');
      await user.type(repeatPasswordInput, 'Clave123!A');
      const toggleButtons = screen.getAllByRole('button', {
        name: 'Mostrar contraseña'
      });

      await user.click(toggleButtons[toggleIndex]);

      expect(passwordInput).toHaveAttribute('type', expectedPasswordType);
      expect(repeatPasswordInput).toHaveAttribute('type', expectedRepeatType);
    }
  );
});

describe('Register Page - SSO Error Handling & Placement', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('positions sso error alert immediately after sso buttons and before footer link when arriving with ssoError', () => {
    const { container } = renderWithProviders(<TestApp />, {
      route: {
        pathname: '/register',
        state: { ssoError: 'Error en proveedor SSO' }
      }
    });

    const ssoButtons = container.querySelector('.auth-sso-buttons');
    const alert = screen.getByRole('alert');
    const footer = container.querySelector('.auth-footer');

    expect(alert).toHaveClass('auth-sso-alert-error');
    expect(
      Boolean(
        ssoButtons &&
        ssoButtons.compareDocumentPosition(alert) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);
    expect(
      Boolean(
        footer &&
        alert.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);
  });

  it('positions general form error alert above the form when registration fails with 429', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'register').mockRejectedValueOnce(
      new ApiError('Too many requests', 429)
    );
    const { container } = renderWithProviders(<TestApp />, {
      route: '/register'
    });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'hortelano');
    await user.type(screen.getByLabelText(/^Contraseña/i), 'Password123!');
    await user.type(
      screen.getByLabelText(/Repetir contraseña/i),
      'Password123!'
    );
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const alert = await screen.findByRole('alert');
    const form = container.querySelector('.auth-form');

    expect(
      Boolean(
        form &&
        alert.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);
  });

  it('dismisses sso error alert when clicking sso button container', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, {
      route: {
        pathname: '/register',
        state: { ssoError: 'Error inicial' }
      }
    });

    const githubButton = screen.getByRole('button', {
      name: /continuar con github/i
    });
    await user.click(githubButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('dismisses sso error alert when submitting registration form', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'register').mockResolvedValueOnce(undefined);
    renderWithProviders(<TestApp />, {
      route: {
        pathname: '/register',
        state: { ssoError: 'Error inicial' }
      }
    });

    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'hortelano@example.com'
    );
    await user.type(screen.getByLabelText(/Nombre de usuario/i), 'hortelano');
    await user.type(screen.getByLabelText(/^Contraseña/i), 'Password123!');
    await user.type(
      screen.getByLabelText(/Repetir contraseña/i),
      'Password123!'
    );
    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' });
    await user.click(submitButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays sso error alert below sso buttons when Google SSO encounters network failure', async () => {
    let capturedCallback: ((res: { credential: string }) => void) | undefined;
    vi.stubGlobal('google', {
      accounts: {
        id: {
          initialize: vi.fn(
            (config: { callback: (res: { credential: string }) => void }) => {
              capturedCallback = config.callback;
            }
          ),
          renderButton: vi.fn(),
          prompt: vi.fn()
        }
      }
    });
    vi.spyOn(authServiceModule, 'authenticateWithGoogle').mockRejectedValueOnce(
      new NetworkError(new Error('Network request failed'))
    );

    const { container } = renderWithProviders(<TestApp />, {
      route: '/register'
    });

    await waitFor(() => expect(capturedCallback).toBeDefined());

    await act(async () => {
      capturedCallback?.({ credential: 'test-id-token' });
    });

    const alert = await screen.findByRole('alert');
    const ssoButtons = container.querySelector('.auth-sso-buttons');

    expect(alert).toHaveClass('auth-sso-alert-error');
    expect(alert).toHaveTextContent(t('auth.sso_unavailable'));
    expect(
      Boolean(
        ssoButtons &&
        ssoButtons.compareDocumentPosition(alert) &
          Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);
  });
});
