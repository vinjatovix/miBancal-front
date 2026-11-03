import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LocationList from '../../../../src/pages/settings/locations/LocationList';
import { buildLocation } from '../../../fixtures/locations/buildLocation';

describe('LocationList', () => {
  it('muestra el loader en estado de carga', () => {
    render(
      <LocationList
        isLoading={true}
        error={null}
        locations={[]}
        currentPage={1}
        totalPages={1}
        currentLimit={25}
        currentSortField="name"
        currentSortDirection="asc"
        onRetry={vi.fn()}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        onSortChange={vi.fn()}
        onCreateNew={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra el estado de error y permite reintentar', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(
      <LocationList
        isLoading={false}
        error={new Error('Network error')}
        locations={[]}
        currentPage={1}
        totalPages={1}
        currentLimit={25}
        currentSortField="name"
        currentSortDirection="asc"
        onRetry={handleRetry}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        onSortChange={vi.fn()}
        onCreateNew={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    const retryButton = screen.getByRole('button', { name: /reintentar/i });
    expect(retryButton).toBeInTheDocument();
    await user.click(retryButton);

    expect(handleRetry).toHaveBeenCalled();
  });

  it('muestra estado vacío con botón para crear la primera ubicación', async () => {
    const user = userEvent.setup();
    const handleCreateNew = vi.fn();
    render(
      <LocationList
        isLoading={false}
        error={null}
        locations={[]}
        currentPage={1}
        totalPages={1}
        currentLimit={25}
        currentSortField="name"
        currentSortDirection="asc"
        onRetry={vi.fn()}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        onSortChange={vi.fn()}
        onCreateNew={handleCreateNew}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(
      screen.getByText('Todavía no tienes ninguna ubicación.')
    ).toBeInTheDocument();
    const createButton = screen.getByRole('button', {
      name: 'Crear la primera ubicación'
    });
    await user.click(createButton);

    expect(handleCreateNew).toHaveBeenCalled();
  });

  it('renderiza tarjetas de ubicaciones cuando hay datos', () => {
    const locations = [
      buildLocation({ id: 'loc-1', name: 'Huerto Norte' }),
      buildLocation({ id: 'loc-2', name: 'Huerto Sur' })
    ];

    render(
      <LocationList
        isLoading={false}
        error={null}
        locations={locations}
        currentPage={1}
        totalPages={1}
        currentLimit={25}
        currentSortField="name"
        currentSortDirection="asc"
        onRetry={vi.fn()}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        onSortChange={vi.fn()}
        onCreateNew={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('Huerto Norte')).toBeInTheDocument();
    expect(screen.getByText('Huerto Sur')).toBeInTheDocument();
  });

  it('no muestra el paginador si solo hay 1 página', () => {
    const locations = [buildLocation({ id: 'loc-1', name: 'Huerto' })];

    render(
      <LocationList
        isLoading={false}
        error={null}
        locations={locations}
        currentPage={1}
        totalPages={1}
        currentLimit={25}
        currentSortField="name"
        currentSortDirection="asc"
        onRetry={vi.fn()}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        onSortChange={vi.fn()}
        onCreateNew={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('muestra el paginador cuando hay más de una página', () => {
    const locations = [buildLocation({ id: 'loc-1', name: 'Huerto' })];

    render(
      <LocationList
        isLoading={false}
        error={null}
        locations={locations}
        currentPage={1}
        totalPages={3}
        currentLimit={25}
        currentSortField="name"
        currentSortDirection="asc"
        onRetry={vi.fn()}
        onPageChange={vi.fn()}
        onLimitChange={vi.fn()}
        onSortChange={vi.fn()}
        onCreateNew={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
