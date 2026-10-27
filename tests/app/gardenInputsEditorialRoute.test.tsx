import '@testing-library/jest-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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

describe('ruta /garden-inputs/new', () => {
  it('redirige a un anónimo a /login', async () => {
    renderRoute('/garden-inputs/new');

    expect(
      await screen.findByRole('heading', { name: t('auth.login') })
    ).toBeInTheDocument();
  });

  it('deniega a un usuario sin rol editorial con aviso', async () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderRoute('/garden-inputs/new');

    expect(
      await screen.findByRole('heading', {
        name: t('auth.insufficient_permissions.title')
      })
    ).toBeInTheDocument();
  });

  it.each([
    ['admin', ADMIN_TEST_TOKEN],
    ['collaborator', COLLABORATOR_TEST_TOKEN]
  ])('permite el acceso a %s', async (_role, token) => {
    setStoredToken(token);

    renderRoute('/garden-inputs/new');

    expect(
      await screen.findByRole('heading', { name: 'Nuevo insumo' })
    ).toBeInTheDocument();
  });
});

describe('rutas públicas de insumos del huerto', () => {
  it('resuelve /garden-inputs al listado sin autenticación', async () => {
    renderRoute('/garden-inputs');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Insumos del huerto'
      })
    ).toBeInTheDocument();
  });

  it('muestra no encontrado en /garden-inputs/:slug cuando la API responde 404', async () => {
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

    renderRoute('/garden-inputs/inexistente');

    expect(
      await screen.findByRole('heading', { name: 'Insumo no encontrado' })
    ).toBeInTheDocument();
  });
});
