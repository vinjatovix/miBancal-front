import { act, screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProtectedRoute from '../../../src/components/auth/ProtectedRoute';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import {
  ADMIN_TEST_TOKEN,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

function LoginHarness() {
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from
    ?.pathname;
  return (
    <div>
      Pantalla de login
      {from && <span data-testid="from-path">{from}</span>}
    </div>
  );
}

function TestHarness({
  requireAdmin = false
}: {
  readonly requireAdmin?: boolean;
}) {
  return (
    <Routes>
      <Route path="/login" element={<LoginHarness />} />
      <Route path="/" element={<div>Pantalla de inicio</div>} />
      <Route
        path="/protected"
        element={
          <ProtectedRoute requireAdmin={requireAdmin}>
            <div>Contenido protegido</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    vi.restoreAllMocks();
  });

  it('redirects anonymous user to /login with state', () => {
    renderWithProviders(<TestHarness />, { route: '/protected' });

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(screen.getByTestId('from-path')).toHaveTextContent('/protected');
    expect(screen.queryByText('Contenido protegido')).toBeNull();
  });

  it('allows access to authenticated user when admin is not required', () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(<TestHarness />, { route: '/protected' });

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('redirects non-admin user to home when admin is required', () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(<TestHarness requireAdmin={true} />, {
      route: '/protected'
    });

    expect(screen.getByText('Pantalla de inicio')).toBeInTheDocument();
    expect(screen.queryByText('Contenido protegido')).toBeNull();
  });

  it('allows access to admin user when admin is required', () => {
    setStoredToken(ADMIN_TEST_TOKEN);

    renderWithProviders(<TestHarness requireAdmin={true} />, {
      route: '/protected'
    });

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('redirects to /login preserving state.from when remote SESSION_LOGOUT event is received', async () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderWithProviders(<TestHarness />, { route: '/protected' });

    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();

    act(() => {
      const channel = new BroadcastChannel('agro_session_sync');
      channel.postMessage({
        type: 'SESSION_LOGOUT',
        eventId: '00000000-0000-4000-8000-000000000099',
        timestamp: Date.now()
      });
      channel.close();
    });

    await vi.waitFor(() => {
      expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
      expect(screen.getByTestId('from-path')).toHaveTextContent('/protected');
    });
    expect(screen.queryByText('Contenido protegido')).toBeNull();
  });
});
