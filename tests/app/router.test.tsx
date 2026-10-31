import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject
} from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { routes } from '../../src/app/router';
import { t } from '../../src/i18n/core/t';
import { AuthProvider } from '../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../src/shared/auth/session';
import {
  ADMIN_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../fixtures/auth/authFixtures';
import { createTestQueryClient } from '../test-utils/createTestQueryClient';
import { stubFetchOk } from '../test-utils/stubFetch';
import {
  getUnexpectedErrorReports,
  silenceConsoleError,
  ThrowingChild
} from '../test-utils/unexpectedErrorReports';
import { buildPlant } from '../fixtures/plants/buildPlant';

function renderRoute(path: string, routeObjects: RouteObject[] = routes) {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
  return router;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('router', () => {
  it('shows the not found page on an unknown route keeping the layout and the URL', () => {
    const router = renderRoute('/ruta-inventada');

    expect(
      screen.getByRole('heading', { level: 1, name: t('notFound.title') })
    ).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('app.nav.account_menu') })
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/ruta-inventada');
    expect(router.state.historyAction).toBe('POP');
  });

  it('shows the app error screen when a layout throws', async () => {
    const errorSpy = silenceConsoleError();
    const [mainRoute] = routes;
    const failingRoutes: RouteObject[] = [
      { ...mainRoute, element: <ThrowingChild /> }
    ];

    renderRoute('/plants', failingRoutes);

    expect(
      await screen.findByRole('heading', { name: t('errors.app.title') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: t('errors.actions.reload') })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(getUnexpectedErrorReports(errorSpy)).toEqual([
        expect.objectContaining({ kind: 'render', section: 'app' })
      ]);
    });
    errorSpy.mockRestore();
  });

  it.each([
    '/',
    '/plants',
    '/plants/678efda2-ac3d-4623-81cd-fc1d0ab80315',
    '/families',
    '/garden-inputs',
    '/login',
    '/register',
    '/activate',
    '/forgot-password',
    '/reset-password'
  ])(
    'mantiene la estructura uniforme de layout en la ruta %s',
    async (path) => {
      const listBody = {
        data: [],
        pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
      };
      vi.stubGlobal(
        'fetch',
        vi.fn((url: string) =>
          Promise.resolve({
            ok: true,
            status: 200,
            statusText: '',
            headers: new Headers({ 'content-type': 'application/json' }),
            json: () =>
              Promise.resolve(
                /\/plants\/[0-9a-f-]{36}/.test(url) ? buildPlant() : listBody
              )
          })
        )
      );

      renderRoute(path);

      expect(await screen.findByRole('banner')).toBeInTheDocument();
      expect(
        await screen.findByRole('button', { name: t('app.nav.account_menu') })
      ).toBeInTheDocument();
      expect(await screen.findByRole('main')).toBeInTheDocument();
    }
  );

  it('lazy-resolves /forgot-password to the ForgotPassword page', async () => {
    renderRoute('/forgot-password');

    expect(
      await screen.findByRole('heading', { name: t('auth.forgot_title') })
    ).toBeInTheDocument();
  });

  it.each([
    ['without a session', false],
    ['with an active session', true]
  ])('lazy-resolves /reset-password %s', async (_, authenticated) => {
    if (authenticated) {
      setStoredToken(VALID_TEST_TOKEN);
    } else {
      clearStoredToken();
    }

    renderRoute('/reset-password');

    expect(
      await screen.findByRole('heading', { name: t('auth.reset_invalid_link') })
    ).toBeInTheDocument();
  });

  it('redirects unauthenticated access from /settings to /login', async () => {
    clearStoredToken();

    renderRoute('/settings');

    expect(
      await screen.findByRole('heading', { name: t('auth.login') })
    ).toBeInTheDocument();
  });

  it('lazy-resolves /settings to the AccountSettings page when authenticated', async () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderRoute('/settings');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: t('settings.title')
      })
    ).toBeInTheDocument();
  });

  it.each(['/plants/new', '/families/new'])(
    'redirects anonymous user from %s to /login',
    async (path) => {
      clearStoredToken();

      renderRoute(path);

      expect(
        await screen.findByRole('heading', { name: t('auth.login') })
      ).toBeInTheDocument();
    }
  );

  it.each(['/plants/new', '/families/new'])(
    'renders InsufficientPermissionsPage on %s for standard user role',
    async (path) => {
      setStoredToken(VALID_TEST_TOKEN);

      renderRoute(path);

      expect(
        await screen.findByRole('heading', {
          name: t('auth.insufficient_permissions.title')
        })
      ).toBeInTheDocument();
    }
  );

  it.each([
    ['/plants/new', 'Nueva planta'],
    ['/families/new', 'Nueva familia']
  ])(
    'renders creation page on %s for editor role',
    async (path, expectedHeading) => {
      setStoredToken(ADMIN_TEST_TOKEN);
      stubFetchOk({
        data: [],
        pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
      });

      renderRoute(path);

      expect(
        await screen.findByRole('heading', { name: expectedHeading })
      ).toBeInTheDocument();
    }
  );
});
