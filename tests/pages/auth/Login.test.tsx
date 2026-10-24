import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/config/env', () => ({
  GOOGLE_CLIENT_ID: 'test-client-id',
  GITHUB_CLIENT_ID: 'test-github-client-id',
  FEATURE_SSO_PREVIEW: false
}));
import Login from '../../../src/pages/auth/Login';
import * as authServiceModule from '../../../src/services/auth.service';
vi.mock('../../../src/shared/auth/googleSdk', () => ({
  loadGoogleSdk: vi.fn().mockResolvedValue(undefined)
}));
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
      <Route path="/admin" element={<div>Panel de administración</div>} />
      <Route path="/register" element={<div>Página de registro</div>} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
    vi.stubGlobal('google', {
      accounts: {
        id: {
          initialize: vi.fn(),
          renderButton: vi.fn(),
          prompt: vi.fn()
        }
      }
    });
  });

  it('redirects to home if user is already authenticated', () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    expect(screen.getByText('Página principal')).toBeInTheDocument();
  });

  it('validates required fields on client without calling API', async () => {
    const user = userEvent.setup();
    const loginSpy = vi.spyOn(authServiceModule, 'login');

    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });
    await user.click(submitButton);

    expect(loginSpy).not.toHaveBeenCalled();
    expect(screen.getAllByText('Campo obligatorio')).toHaveLength(2);
  });

  it('validates email format on client', async () => {
    const user = userEvent.setup();
    const loginSpy = vi.spyOn(authServiceModule, 'login');

    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });

    await user.type(emailInput, 'correo-invalido');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    expect(loginSpy).not.toHaveBeenCalled();
    expect(
      screen.getByText('Introduce una dirección de correo válida')
    ).toBeInTheDocument();
  });

  it('logs in successfully and redirects to home', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'login').mockResolvedValueOnce({
      token: VALID_TEST_TOKEN
    });

    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });

    await user.type(emailInput, 'hortelano@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    expect(await screen.findByText('Página principal')).toBeInTheDocument();
  });

  it('shows uniform error message and activation notice on 401', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'login').mockRejectedValueOnce(
      new ApiError('Unauthorized', 401)
    );

    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });

    await user.type(emailInput, 'hortelano@example.com');
    await user.type(passwordInput, 'WrongPassword!');
    await user.click(submitButton);

    expect(
      await screen.findByText('Credenciales no válidas')
    ).toBeInTheDocument();
    expect(
      screen.getByText('¿No has activado tu cuenta? Revisa tu correo')
    ).toBeInTheDocument();
  });

  it('handles 429 rate limit error showing localized message', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'login').mockRejectedValueOnce(
      new ApiError('Too Many Requests', 429)
    );

    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });

    await user.type(emailInput, 'hortelano@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    expect(
      await screen.findByText(
        'Demasiados intentos. Por favor, inténtalo más tarde.'
      )
    ).toBeInTheDocument();
  });

  it('displays rate limit notice in alert when arriving with ssoError', () => {
    renderWithProviders(<TestApp />, {
      route: {
        pathname: '/login',
        state: {
          ssoError: 'Demasiados intentos. Por favor, inténtalo más tarde.'
        }
      }
    });

    const alert = screen.getByRole('alert');

    expect(alert).toHaveClass('auth-alert-error');
    expect(alert).toHaveTextContent(
      'Demasiados intentos. Por favor, inténtalo más tarde.'
    );
  });

  it('keeps form inputs fully interactive when arriving with ssoError', () => {
    renderWithProviders(<TestApp />, {
      route: {
        pathname: '/login',
        state: {
          ssoError: 'Demasiados intentos. Por favor, inténtalo más tarde.'
        }
      }
    });

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });

    expect(emailInput).toBeEnabled();
    expect(passwordInput).toBeEnabled();
    expect(submitButton).toBeEnabled();
  });

  it('contains link to register page', () => {
    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    const registerLink = screen.getByRole('link', {
      name: /¿No tienes cuenta\? Regístrate/i
    });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('contains link to the forgot password page', () => {
    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    const forgotLink = screen.getByRole('link', {
      name: /¿Olvidaste la contraseña\?/i
    });
    expect(forgotLink).toBeInTheDocument();
    expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });

  it('authenticates successfully via Google SSO', async () => {
    const user = userEvent.setup();
    let capturedCallback:
      | ((response: { readonly credential: string }) => void)
      | undefined;
    const initializeSpy = vi.fn(
      (config: {
        readonly callback: (response: { readonly credential: string }) => void;
      }) => {
        capturedCallback = config.callback;
      }
    );
    vi.stubGlobal('google', {
      accounts: {
        id: {
          initialize: initializeSpy,
          renderButton: vi.fn(),
          prompt: vi.fn()
        }
      }
    });
    vi.spyOn(authServiceModule, 'authenticateWithGoogle').mockResolvedValueOnce(
      {
        token: VALID_TEST_TOKEN
      }
    );

    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    await waitFor(() => expect(initializeSpy).toHaveBeenCalled());

    const googleButton = screen.getByRole('button', {
      name: /continuar con google/i
    });
    await user.click(googleButton);

    await act(async () => {
      capturedCallback?.({ credential: 'test-id-token' });
    });

    expect(await screen.findByText('Página principal')).toBeInTheDocument();
  });

  it('displays sso_unavailable alert when Google SSO encounters network failure', async () => {
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

    renderWithProviders(<TestApp />, {
      route: '/login'
    });

    await waitFor(() => expect(capturedCallback).toBeDefined());

    await act(async () => {
      capturedCallback?.({ credential: 'test-id-token' });
    });

    expect(
      await screen.findByText(t('auth.sso_unavailable'))
    ).toBeInTheDocument();
  });

  it('redirects to originating location including search query and hash', () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(
      <Routes>
        <Route path="/" element={<div>Página principal</div>} />
        <Route path="/plants" element={<div>Listado de plantas</div>} />
        <Route path="/login" element={<Login />} />
      </Routes>,
      {
        route: {
          pathname: '/login',
          state: {
            from: {
              pathname: '/plants',
              search: '?cycle=annual',
              hash: '#gallery'
            }
          }
        }
      }
    );

    expect(screen.getByText('Listado de plantas')).toBeInTheDocument();
  });

  it.each([
    ['login itself', '/login'],
    ['register page', '/register'],
    ['protocol relative url', '//malicious.example.com']
  ])('falls back to home when origin is %s', (_, unsafePath) => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(
      <Routes>
        <Route path="/" element={<div>Página principal</div>} />
        <Route path="/login" element={<Login />} />
      </Routes>,
      {
        route: {
          pathname: '/login',
          state: {
            from: {
              pathname: unsafePath
            }
          }
        }
      }
    );

    expect(screen.getByText('Página principal')).toBeInTheDocument();
  });
});

describe('Login Page - password visibility toggle', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('renders password input initially masked with type password (C6)', () => {
    renderWithProviders(<TestApp />, { route: '/login' });

    const passwordInput = screen.getByLabelText('Contraseña');

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('renders toggle button with accessible name Mostrar contraseña (C1)', () => {
    renderWithProviders(<TestApp />, { route: '/login' });

    const toggleButton = screen.getByRole('button', {
      name: 'Mostrar contraseña'
    });

    expect(toggleButton).toBeInTheDocument();
  });

  it('reveals password in plain text on toggle click (C2)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { route: '/login' });
    const passwordInput = screen.getByLabelText('Contraseña');
    await user.type(passwordInput, 'MiSecreto123');

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('preserves typed password value when toggling visibility (C4)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { route: '/login' });
    const passwordInput = screen.getByLabelText('Contraseña');
    await user.type(passwordInput, 'MiSecreto123');

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    expect(passwordInput).toHaveValue('MiSecreto123');
  });

  it('updates accessible toggle button name to Ocultar contraseña on click (C2)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { route: '/login' });

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    const toggleButton = screen.getByRole('button', {
      name: 'Ocultar contraseña'
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it('re-masks password to type password on second toggle click (C3)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { route: '/login' });
    const passwordInput = screen.getByLabelText('Contraseña');
    await user.type(passwordInput, 'MiSecreto123');
    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    await user.click(
      screen.getByRole('button', { name: 'Ocultar contraseña' })
    );

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('restores accessible toggle button name to Mostrar contraseña on second toggle click (C3)', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { route: '/login' });
    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    await user.click(
      screen.getByRole('button', { name: 'Ocultar contraseña' })
    );

    const toggleButton = screen.getByRole('button', {
      name: 'Mostrar contraseña'
    });
    expect(toggleButton).toBeInTheDocument();
  });

  it('does not trigger login submission when clicking visibility toggle (C5)', async () => {
    const user = userEvent.setup();
    const loginSpy = vi.spyOn(authServiceModule, 'login');
    renderWithProviders(<TestApp />, { route: '/login' });
    await user.type(
      screen.getByLabelText(/Correo electrónico/i),
      'test@example.com'
    );
    await user.type(screen.getByLabelText('Contraseña'), 'ValidPass123!');

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    expect(loginSpy).not.toHaveBeenCalled();
  });

  it('toggles visibility on empty password input without errors', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, { route: '/login' });

    await user.click(
      screen.getByRole('button', { name: 'Mostrar contraseña' })
    );

    const passwordInput = screen.getByLabelText('Contraseña');
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});

describe('Login Page - User Story 3 (Alerts & Navigation Integration)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:3000',
        pathname: '/login',
        href: ''
      },
      writable: true
    });
  });

  it.each([
    ['ssoError', { ssoError: 'Error desde proveedor externo' }],
    ['error', { error: 'Error legacy compatible' }]
  ])(
    'renders alert when receiving error via %s in location state',
    (_, statePayload) => {
      const expectedMessage =
        'ssoError' in statePayload ? statePayload.ssoError : statePayload.error;
      renderWithProviders(<TestApp />, {
        route: {
          pathname: '/login',
          state: statePayload
        }
      });

      const alert = screen.getByRole('alert');

      expect(alert).toHaveClass('auth-alert-error');
      expect(alert).toHaveTextContent(expectedMessage);
    }
  );

  it('positions sso error alert immediately after sso buttons and before footer link', () => {
    const { container } = renderWithProviders(<TestApp />, {
      route: {
        pathname: '/login',
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

  it('positions form server error above the form', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'login').mockRejectedValueOnce(
      new ApiError('Invalid credentials', 401)
    );
    const { container } = renderWithProviders(<TestApp />, {
      route: '/login'
    });

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    const alert = await screen.findByRole('alert');
    const form = container.querySelector('.auth-form');

    expect(
      Boolean(
        form &&
        alert.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING
      )
    ).toBe(true);
  });

  it('purges error from location state on mount while preserving from', async () => {
    function StateTracker() {
      const location = useLocation();
      return (
        <div data-testid="router-state">{JSON.stringify(location.state)}</div>
      );
    }

    renderWithProviders(
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <Login />
              <StateTracker />
            </>
          }
        />
      </Routes>,
      {
        route: {
          pathname: '/login',
          state: {
            ssoError: 'Error temporal',
            from: '/admin'
          }
        }
      }
    );

    expect(await screen.findByTestId('router-state')).toHaveTextContent(
      '{"from":"/admin"}'
    );
  });

  it('renders without error alert after simulated reload with purged state', () => {
    renderWithProviders(<TestApp />, {
      route: {
        pathname: '/login',
        state: { from: '/admin' }
      }
    });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('dismisses error alert when submitting login form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, {
      route: {
        pathname: '/login',
        state: { ssoError: 'Error inicial' }
      }
    });

    const submitButton = screen.getByRole('button', {
      name: 'Iniciar sesión'
    });
    await user.click(submitButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('dismisses error alert when clicking Google SSO button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, {
      route: {
        pathname: '/login',
        state: { ssoError: 'Error inicial' }
      }
    });

    const googleButton = screen.getByRole('button', {
      name: /continuar con google/i
    });
    await user.click(googleButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('dismisses error alert when clicking GitHub SSO button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TestApp />, {
      route: {
        pathname: '/login',
        state: { ssoError: 'Error inicial' }
      }
    });

    const githubButton = screen.getByRole('button', {
      name: /continuar con github/i
    });
    await user.click(githubButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('redirects to preserved string from destination after successful login', async () => {
    const user = userEvent.setup();
    vi.spyOn(authServiceModule, 'login').mockResolvedValueOnce({
      token: VALID_TEST_TOKEN
    });
    renderWithProviders(<TestApp />, {
      route: {
        pathname: '/login',
        state: {
          ssoError: 'Error inicial',
          from: '/admin'
        }
      }
    });

    const emailInput = screen.getByLabelText(/Correo electrónico/i);
    const passwordInput = screen.getByLabelText('Contraseña');
    const submitButton = screen.getByRole('button', {
      name: 'Iniciar sesión'
    });
    await user.type(emailInput, 'hortelano@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);

    expect(
      await screen.findByText('Panel de administración')
    ).toBeInTheDocument();
  });

  it.each([['//malicious.example.com'], ['/login'], ['/register']])(
    'sanitizes unsafe from %s to home upon successful login',
    async (unsafeFrom) => {
      const user = userEvent.setup();
      vi.spyOn(authServiceModule, 'login').mockResolvedValueOnce({
        token: VALID_TEST_TOKEN
      });
      renderWithProviders(<TestApp />, {
        route: {
          pathname: '/login',
          state: {
            ssoError: 'Error inicial',
            from: unsafeFrom
          }
        }
      });

      const emailInput = screen.getByLabelText(/Correo electrónico/i);
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', {
        name: 'Iniciar sesión'
      });
      await user.type(emailInput, 'hortelano@example.com');
      await user.type(passwordInput, 'Password123!');
      await user.click(submitButton);

      expect(await screen.findByText('Página principal')).toBeInTheDocument();
    }
  );
});
