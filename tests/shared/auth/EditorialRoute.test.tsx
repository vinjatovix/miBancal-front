import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { EditorialRoute } from '../../../src/shared/auth/EditorialRoute';
import {
  ADMIN_TEST_TOKEN,
  createTestJwt,
  VALID_TEST_TOKEN
} from '../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

describe('EditorialRoute', () => {
  it('redirects anonymous user to /login preserving target location in state', () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/plants/new"
          element={
            <EditorialRoute>
              <div>PROTECTED EDITORIAL CONTENT</div>
            </EditorialRoute>
          }
        />
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
      </Routes>,
      { route: '/plants/new' }
    );

    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
    expect(
      screen.queryByText('PROTECTED EDITORIAL CONTENT')
    ).not.toBeInTheDocument();
  });

  it('renders InsufficientPermissionsPage when user is authenticated with standard user role', async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/plants/new"
          element={
            <EditorialRoute>
              <div>PROTECTED EDITORIAL CONTENT</div>
            </EditorialRoute>
          }
        />
      </Routes>,
      {
        route: '/plants/new',
        initialToken: VALID_TEST_TOKEN
      }
    );

    expect(
      await screen.findByRole('heading', { name: 'Permisos insuficientes' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('PROTECTED EDITORIAL CONTENT')
    ).not.toBeInTheDocument();
  });

  it.each([
    ['admin', ADMIN_TEST_TOKEN],
    ['collaborator', createTestJwt({ roles: ['collaborator'] })]
  ])('renders protected children when user has %s role', (_role, token) => {
    renderWithProviders(
      <Routes>
        <Route
          path="/plants/new"
          element={
            <EditorialRoute>
              <div>PROTECTED EDITORIAL CONTENT</div>
            </EditorialRoute>
          }
        />
      </Routes>,
      {
        route: '/plants/new',
        initialToken: token
      }
    );

    expect(screen.getByText('PROTECTED EDITORIAL CONTENT')).toBeInTheDocument();
  });
});
