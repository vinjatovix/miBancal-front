import { render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { describe, it, expect, beforeEach } from 'vitest';
import { t } from '../../src/i18n/core/t';
import RouteErrorFallback from '../../src/pages/RouteErrorFallback';
import {
  getUnexpectedErrorReports,
  silenceConsoleError,
  ThrowingChild
} from '../test-utils/unexpectedErrorReports';

const errorSpy = silenceConsoleError();

function Layout() {
  return (
    <div>
      <nav>Cabecera</nav>
      <Outlet />
    </div>
  );
}

function renderFailingPage() {
  const router = createMemoryRouter(
    [
      {
        element: <Layout />,
        children: [
          {
            errorElement: <RouteErrorFallback />,
            children: [{ path: '/plants', element: <ThrowingChild /> }]
          }
        ]
      }
    ],
    { initialEntries: ['/plants'] }
  );
  render(<RouterProvider router={router} />);
}

describe('RouteErrorFallback', () => {
  beforeEach(() => {
    errorSpy.mockClear();
  });

  it('shows the page notice inside the layout with a link home', () => {
    renderFailingPage();

    expect(
      screen.getByRole('heading', { name: t('errors.page.title') })
    ).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      t('errors.page.message')
    );
    expect(
      screen.getByRole('link', { name: t('errors.actions.goHome') })
    ).toHaveAttribute('href', '/');
    expect(screen.getByRole('navigation')).toHaveTextContent('Cabecera');
  });

  it('reports the failure once as a page section', () => {
    renderFailingPage();

    expect(getUnexpectedErrorReports(errorSpy)).toEqual([
      expect.objectContaining({ kind: 'render', section: 'page' })
    ]);
  });
});
