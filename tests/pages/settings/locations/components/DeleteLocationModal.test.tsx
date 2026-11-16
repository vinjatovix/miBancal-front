import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import DeleteLocationModal from '../../../../../src/pages/settings/locations/components/DeleteLocationModal/DeleteLocationModal';
import { buildLocation } from '../../../../fixtures/locations/buildLocation';

describe('DeleteLocationModal', () => {
  it('muestra el modal con el nombre de la ubicación', () => {
    const location = buildLocation({ name: 'Huerto de pruebas' });

    render(
      <DeleteLocationModal
        isOpen={true}
        location={location}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Eliminar ubicación?')).toBeInTheDocument();
    expect(screen.getByText(/Huerto de pruebas/)).toBeInTheDocument();
  });

  it('permite cancelar la acción', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const location = buildLocation();

    render(
      <DeleteLocationModal
        isOpen={true}
        location={location}
        onClose={handleClose}
        onConfirm={vi.fn()}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
    await user.click(cancelButton);

    expect(handleClose).toHaveBeenCalled();
  });

  it('permite confirmar la eliminación', async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    const location = buildLocation();

    render(
      <DeleteLocationModal
        isOpen={true}
        location={location}
        onClose={vi.fn()}
        onConfirm={handleConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', {
      name: 'Eliminar'
    });
    await user.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalledWith(location);
  });
});
