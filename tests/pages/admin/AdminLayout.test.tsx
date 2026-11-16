import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminLayout from '../../../src/pages/admin/AdminLayout';
import { AuthProvider } from '../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../src/shared/auth/session';
import { ADMIN_TEST_TOKEN } from '../../fixtures/auth/authFixtures';

function renderAdminLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/admin',
        element: (
          <AuthProvider>
            <AdminLayout />
          </AuthProvider>
        ),
        children: [
          {
            index: true,
            element: <div>Contenido de administración</div>
          }
        ]
      }
    ],
    {
      initialEntries: ['/admin']
    }
  );

  return render(<RouterProvider router={router} />);
}

describe('AdminLayout', () => {
  beforeEach(() => {
    sessionStorage.clear();
    clearStoredToken();
    setStoredToken(ADMIN_TEST_TOKEN);
    vi.restoreAllMocks();
  });

  it('renders admin layout with banner and main landmarks', () => {
    renderAdminLayout();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('does not render AppNavRail in admin layout', () => {
    renderAdminLayout();

    const rail = screen.queryByRole('navigation', {
      name: 'Navegación principal'
    });

    expect(rail).toBeNull();
  });

  it('does not render AppBottomNav in admin layout', () => {
    renderAdminLayout();

    const bottomNav = screen.queryByRole('navigation', {
      name: 'Navegación inferior'
    });

    expect(bottomNav).toBeNull();
  });

  it('opens AdminNavDrawer when menu toggle button is clicked', async () => {
    const user = userEvent.setup();
    renderAdminLayout();

    const toggleButton = screen.getByRole('button', {
      name: /Menú de navegación/i
    });
    await user.click(toggleButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
