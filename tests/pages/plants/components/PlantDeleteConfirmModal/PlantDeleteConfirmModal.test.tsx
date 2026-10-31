import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PlantDeleteConfirmModal } from '../../../../../src/pages/plants/components/PlantDeleteConfirmModal/PlantDeleteConfirmModal';

describe('PlantDeleteConfirmModal', () => {
  it('does not render dialog when isOpen is false', () => {
    render(
      <PlantDeleteConfirmModal
        isOpen={false}
        plantName="Tomate cherry"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal dialog content when isOpen is true', () => {
    render(
      <PlantDeleteConfirmModal
        isOpen={true}
        plantName="Tomate cherry"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Eliminar planta')).toBeInTheDocument();
    expect(
      screen.getByText(
        '¿Estás seguro de que deseas eliminar «Tomate cherry» del catálogo?'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Eliminar' })
    ).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <PlantDeleteConfirmModal
        isOpen={true}
        plantName="Tomate cherry"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <PlantDeleteConfirmModal
        isOpen={true}
        plantName="Tomate cherry"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when pressing Escape key', () => {
    const onCancel = vi.fn();
    render(
      <PlantDeleteConfirmModal
        isOpen={true}
        plantName="Tomate cherry"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('disables buttons when isDeleting is true', () => {
    render(
      <PlantDeleteConfirmModal
        isOpen={true}
        plantName="Tomate cherry"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isDeleting={true}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Eliminando...' })
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('renders conflict alert and calls onReload when conflict occurs', () => {
    const onReload = vi.fn();

    render(
      <PlantDeleteConfirmModal
        isOpen={true}
        plantName="Tomate cherry"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isConflict={true}
        onReload={onReload}
      />
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Recargar datos actuales' })
    );

    expect(
      screen.getByText(/Esta planta fue modificada por otro usuario/i)
    ).toBeInTheDocument();
    expect(onReload).toHaveBeenCalled();
  });

  it('does not render static error alert banner in modal body', () => {
    render(
      <PlantDeleteConfirmModal
        isOpen={true}
        plantName="Tomate cherry"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
