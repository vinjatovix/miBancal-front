import '@testing-library/jest-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

import { routes } from '../../src/app/router';
import { t } from '../../src/i18n/core/t';
import { AuthProvider } from '../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../src/shared/auth/session';
import {
  ADMIN_TEST_TOKEN,
  COLLABORATOR_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../fixtures/auth/authFixtures';
import { buildAnomaly } from '../fixtures/anomalies/buildAnomaly';
import { createTestQueryClient } from '../test-utils/createTestQueryClient';
import { stubFetchOk } from '../test-utils/stubFetch';

function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
  return router;
}

beforeEach(() => {
  sessionStorage.clear();
  clearStoredToken();
  stubFetchOk({
    data: [],
    pagination: { page: 1, limit: 25, totalPages: 0, totalItems: 0 }
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('route /anomalies/new', () => {
  it('redirects an anonymous user to /login', async () => {
    renderRoute('/anomalies/new');

    expect(
      await screen.findByRole('heading', { name: t('auth.login') })
    ).toBeInTheDocument();
  });

  it('deniega a un usuario sin rol editorial con aviso y retorno al catálogo', async () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderRoute('/anomalies/new');

    expect(
      await screen.findByRole('heading', {
        name: t('auth.insufficient_permissions.title')
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: t('auth.insufficient_permissions.back_to_anomalies')
      })
    ).toHaveAttribute('href', '/anomalies');
  });

  it.each([
    ['admin', ADMIN_TEST_TOKEN],
    ['collaborator', COLLABORATOR_TEST_TOKEN]
  ])('permite el acceso a %s', async (_role, token) => {
    setStoredToken(token);

    renderRoute('/anomalies/new');

    expect(
      await screen.findByRole('heading', { name: 'Nueva anomalía' })
    ).toBeInTheDocument();
  });
});

describe('public anomalies routes', () => {
  it('resuelve /anomalies al listado sin autenticación', async () => {
    renderRoute('/anomalies');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Anomalías' })
    ).toBeInTheDocument();
  });

  it('shows not found on /anomalies/:slug when API returns 404', async () => {
    stubFetchOk({});
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: '',
          headers: new Headers({ 'content-type': 'application/json' }),
          json: () => Promise.resolve({ message: 'not found' })
        })
      )
    );

    renderRoute('/anomalies/inexistente');

    expect(
      await screen.findByRole('heading', { name: 'Anomalía no encontrada' })
    ).toBeInTheDocument();
  });
});

describe('unsaved changes guard in /anomalies/new', () => {
  function stubCreateFlow() {
    const anomaly = buildAnomaly();
    const fetchMock = vi.fn((url: string, init?: RequestInit) => {
      const isCreate = init?.method === 'POST';
      return Promise.resolve({
        ok: true,
        status: isCreate ? 201 : 200,
        statusText: '',
        headers: new Headers({
          'content-type': 'application/json',
          ETag: '"v1"'
        }),
        json: () =>
          Promise.resolve(
            url.includes('/anomalies?')
              ? {
                  data: [],
                  pagination: {
                    page: 1,
                    limit: 25,
                    totalPages: 0,
                    totalItems: 0
                  }
                }
              : anomaly
          )
      });
    });
    vi.stubGlobal('fetch', fetchMock);
  }

  async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^Nombre común/), 'Pulgón verde');
    await user.type(screen.getByLabelText(/^Slug para URL/), 'pulgon-verde');
    await user.selectOptions(screen.getByLabelText(/^Categoría/), 'pest');
  }

  it('does not block navigation after a successful save', async () => {
    stubCreateFlow();
    setStoredToken(COLLABORATOR_TEST_TOKEN);
    const user = userEvent.setup();
    const router = renderRoute('/anomalies/new');

    await screen.findByRole('heading', { name: 'Nueva anomalía' });
    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pulgón verde' })
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/anomalies/pulgon-verde');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('blocks leaving the form with changes via navigation', async () => {
    stubCreateFlow();
    setStoredToken(COLLABORATOR_TEST_TOKEN);
    const user = userEvent.setup();
    const router = renderRoute('/anomalies/new');

    await screen.findByRole('heading', { name: 'Nueva anomalía' });
    await user.type(screen.getByLabelText(/^Nombre común/), 'Pulgón');

    const nav = screen.getByRole('navigation', {
      name: t('app.nav.rail_title')
    });
    await user.click(
      within(nav).getByRole('link', { name: t('app.nav.anomalies') })
    );

    expect(await screen.findByRole('alertdialog')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/anomalies/new');
  });

  it('no vuelve a pedir confirmación tras descartar con Cancelar', async () => {
    stubCreateFlow();
    setStoredToken(COLLABORATOR_TEST_TOKEN);
    const user = userEvent.setup();
    const router = renderRoute('/anomalies/new');

    await screen.findByRole('heading', { name: 'Nueva anomalía' });
    await user.type(screen.getByLabelText(/^Nombre común/), 'Pulgón');
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await user.click(
      await screen.findByRole('button', { name: 'Descartar cambios' })
    );

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Anomalías' })
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/anomalies');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
