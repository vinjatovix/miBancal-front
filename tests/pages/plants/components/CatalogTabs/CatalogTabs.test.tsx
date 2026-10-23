import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import CatalogTabs from '../../../../../src/pages/plants/components/CatalogTabs/CatalogTabs';
import { AuthProvider } from '../../../../../src/shared/auth/AuthContext';
import {
  clearStoredToken,
  setStoredToken
} from '../../../../../src/shared/auth/session';

import { VALID_TEST_TOKEN } from '../../../../fixtures/auth/authFixtures';

function LocationProbe() {
  return <span data-testid="search">{useLocation().search}</span>;
}

function renderCatalogTabs(route = '/plants') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <LocationProbe />
                <CatalogTabs />
              </>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

beforeEach(() => {
  sessionStorage.clear();
  clearStoredToken();
});

describe('CatalogTabs: visibilidad', () => {
  it('no se renderiza sin sesión', () => {
    renderCatalogTabs();

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('se renderiza con sesión, con "Todas" activa por defecto', () => {
    setStoredToken(VALID_TEST_TOKEN);

    renderCatalogTabs();

    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(
      screen.getByRole('button', { name: 'Mis Favoritas' })
    ).toHaveAttribute('aria-pressed', 'false');
  });
});

describe('CatalogTabs: navegación', () => {
  beforeEach(() => {
    setStoredToken(VALID_TEST_TOKEN);
  });

  it('seleccionar "Mis Favoritas" escribe ?tab=favorites y reinicia page', () => {
    renderCatalogTabs('/plants?page=3&limit=50');

    act(() => {
      screen.getByRole('button', { name: 'Mis Favoritas' }).click();
    });

    const search = new URLSearchParams(
      screen.getByTestId('search').textContent ?? ''
    );
    expect(search.get('tab')).toBe('favorites');
    expect(search.has('page')).toBe(false);
    expect(search.get('limit')).toBe('50');
  });

  it('volver a "Todas" elimina el parámetro tab', () => {
    renderCatalogTabs('/plants?tab=favorites&limit=50');

    act(() => {
      screen.getByRole('button', { name: 'Todas' }).click();
    });

    const search = new URLSearchParams(
      screen.getByTestId('search').textContent ?? ''
    );
    expect(search.has('tab')).toBe(false);
    expect(search.get('limit')).toBe('50');
  });
});
