import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AdminRoute } from '../../../src/shared/auth/AdminRoute';
import {
  ADMIN_TEST_TOKEN,
  createTestJwt,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('AdminRoute', () => {
  it('redirects unauthenticated user to home page', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>PROTECTED ADMIN CONTENT</div>
            </AdminRoute>
          }
        />
        <Route path="/" element={<div>HOME PAGE</div>} />
      </Routes>,
      { route: '/admin' }
    );

    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
    expect(
      screen.queryByText('PROTECTED ADMIN CONTENT')
    ).not.toBeInTheDocument();
  });

  it.each([
    ['standard user', VALID_TEST_TOKEN],
    ['collaborator', createTestJwt({ roles: ['collaborator'] })]
  ])('redirects user with %s role to home page', (_role, token) => {
    renderWithProviders(
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>PROTECTED ADMIN CONTENT</div>
            </AdminRoute>
          }
        />
        <Route path="/" element={<div>HOME PAGE</div>} />
      </Routes>,
      {
        route: '/admin',
        initialToken: token
      }
    );

    expect(screen.getByText('HOME PAGE')).toBeInTheDocument();
    expect(
      screen.queryByText('PROTECTED ADMIN CONTENT')
    ).not.toBeInTheDocument();
  });

  it('renders protected children when user is admin', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>PROTECTED ADMIN CONTENT</div>
            </AdminRoute>
          }
        />
      </Routes>,
      {
        route: '/admin',
        initialToken: ADMIN_TEST_TOKEN
      }
    );

    expect(screen.getByText('PROTECTED ADMIN CONTENT')).toBeInTheDocument();
  });
});
