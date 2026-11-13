import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import LocationCard from '../../../../../src/pages/settings/locations/components/LocationCard/LocationCard';
import { buildLocation } from '../../../../fixtures/locations/buildLocation';

function renderCard(ui: ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('LocationCard', () => {
  it('renderiza el nombre y las coordenadas de la ubicación', () => {
    const location = buildLocation({
      name: 'Mi Huerto',
      latitude: 40.4168,
      longitude: -3.7038
    });

    renderCard(
      <LocationCard location={location} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Mi Huerto' })
    ).toBeInTheDocument();
    expect(screen.getByText('40.4168°, -3.7038°')).toBeInTheDocument();
  });

  it('enlaza a la disposición espacial de la ubicación', () => {
    const location = buildLocation({ id: 'loc-1', name: 'Mi Huerto' });

    renderCard(
      <LocationCard location={location} onEdit={vi.fn()} onDelete={vi.fn()} />
    );

    expect(
      screen.getByRole('link', { name: 'Ver disposición' })
    ).toHaveAttribute('href', '/locations/loc-1/layout');
  });

  it('notifica la acción de editar con la ubicación correspondiente', async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();
    const location = buildLocation({ name: 'Huerto a editar' });

    renderCard(
      <LocationCard
        location={location}
        onEdit={handleEdit}
        onDelete={vi.fn()}
      />
    );

    const editBtn = screen.getByRole('button', {
      name: 'Editar Huerto a editar'
    });
    await user.click(editBtn);

    expect(handleEdit).toHaveBeenCalledWith(location);
  });

  it('notifica la acción de eliminar con la ubicación correspondiente', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();
    const location = buildLocation({ name: 'Huerto a eliminar' });

    renderCard(
      <LocationCard
        location={location}
        onEdit={vi.fn()}
        onDelete={handleDelete}
      />
    );

    const deleteBtn = screen.getByRole('button', {
      name: 'Eliminar Huerto a eliminar'
    });
    await user.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith(location);
  });
});
