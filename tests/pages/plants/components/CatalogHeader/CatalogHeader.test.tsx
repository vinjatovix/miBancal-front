import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import CatalogHeader from '../../../../../src/pages/plants/components/CatalogHeader/CatalogHeader';
import { renderWithProviders } from '../../../../test-utils/renderWithProviders';

const formatEs = (value: number) => new Intl.NumberFormat('es').format(value);

describe('CatalogHeader', () => {
  it('shows total species with thousand separator', () => {
    renderWithProviders(<CatalogHeader totalItems={1842} summary="" />);

    expect(screen.getByText(`${formatEs(1842)} especies`)).toBeInTheDocument();
  });

  it('shows "0 species" with zero results', () => {
    renderWithProviders(<CatalogHeader totalItems={0} summary="" />);

    expect(screen.getByText('0 especies')).toBeInTheDocument();
  });

  it('shows summary by segments when there are filters', () => {
    renderWithProviders(
      <CatalogHeader totalItems={10} summary="Filtrado activo: Perenne" />
    );

    expect(screen.getByText('Filtrado activo: Perenne')).toBeInTheDocument();
  });

  it('omite el resumen sin filtros', () => {
    renderWithProviders(<CatalogHeader totalItems={10} summary="" />);

    expect(screen.queryByText(/Filtrado activo/)).not.toBeInTheDocument();
  });

  it('does not show counts while total is unknown', () => {
    renderWithProviders(<CatalogHeader totalItems={undefined} summary="" />);

    expect(screen.queryByText(/especies/)).not.toBeInTheDocument();
  });
});
