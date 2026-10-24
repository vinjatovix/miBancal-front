import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CatalogHeader from '../../../../../src/pages/plants/components/CatalogHeader/CatalogHeader';
import {
  ADMIN_TEST_TOKEN,
  createTestJwt,
  VALID_TEST_TOKEN
} from '../../../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';

const formatEs = (value: number) => new Intl.NumberFormat('es').format(value);

describe('CatalogHeader', () => {
  it('muestra el total de especies con separador de miles', () => {
    renderWithProviders(<CatalogHeader totalItems={1842} summary="" />);

    expect(screen.getByText(`${formatEs(1842)} especies`)).toBeInTheDocument();
  });

  it('muestra "0 especies" con cero resultados', () => {
    renderWithProviders(<CatalogHeader totalItems={0} summary="" />);

    expect(screen.getByText('0 especies')).toBeInTheDocument();
  });

  it('muestra el resumen por segmentos cuando hay filtros', () => {
    renderWithProviders(
      <CatalogHeader totalItems={10} summary="Filtrado activo: Perenne" />
    );

    expect(screen.getByText('Filtrado activo: Perenne')).toBeInTheDocument();
  });

  it('omite el resumen sin filtros', () => {
    renderWithProviders(<CatalogHeader totalItems={10} summary="" />);

    expect(screen.queryByText(/Filtrado activo/)).not.toBeInTheDocument();
  });

  it('no muestra recuentos mientras el total es desconocido', () => {
    renderWithProviders(<CatalogHeader totalItems={undefined} summary="" />);

    expect(screen.queryByText(/especies/)).not.toBeInTheDocument();
  });

  it('does not render Nueva planta button for anonymous user', () => {
    renderWithProviders(<CatalogHeader totalItems={10} summary="" />);

    expect(
      screen.queryByRole('link', { name: /nueva planta/i })
    ).not.toBeInTheDocument();
  });

  it('does not render Nueva planta button for regular user', () => {
    renderWithProviders(<CatalogHeader totalItems={10} summary="" />, {
      initialToken: VALID_TEST_TOKEN
    });

    expect(
      screen.queryByRole('link', { name: /nueva planta/i })
    ).not.toBeInTheDocument();
  });

  it.each([
    ['admin', ADMIN_TEST_TOKEN],
    ['collaborator', createTestJwt({ roles: ['collaborator'] })]
  ])(
    'renders Nueva planta button linking to /plants/new for %s',
    (_role, token) => {
      renderWithProviders(<CatalogHeader totalItems={10} summary="" />, {
        initialToken: token
      });

      const createLink = screen.getByRole('link', { name: /nueva planta/i });
      expect(createLink).toBeInTheDocument();
      expect(createLink).toHaveAttribute('href', '/plants/new');
    }
  );
});
