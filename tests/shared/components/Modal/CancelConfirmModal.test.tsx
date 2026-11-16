import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CancelConfirmModal } from '../../../../src/shared/components/Modal/CancelConfirmModal';

describe('CancelConfirmModal', () => {
  it('renders default modal content and buttons', () => {
    render(
      <CancelConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Descartar cambios' })
    ).toBeInTheDocument();
    expect(screen.getByText('Cambios sin guardar')).toBeInTheDocument();
    expect(
      screen.getByText('Hay cambios sin guardar. ¿Deseas descartarlos y salir?')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Descartar cambios' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continuar editando' })
    ).toBeInTheDocument();
  });

  it('calls onConfirm when discard button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <CancelConfirmModal
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Descartar cambios' }));

    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when keep editing button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <CancelConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Continuar editando' }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('calls onCancel when pressing Escape key', () => {
    const onCancel = vi.fn();
    render(
      <CancelConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onCancel).toHaveBeenCalled();
  });

  it('renders custom prompt when provided', () => {
    render(
      <CancelConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        prompt="Tienes cambios en la ficha de la planta."
      />
    );

    expect(
      screen.getByText('Tienes cambios en la ficha de la planta.')
    ).toBeInTheDocument();
  });

  it('renders custom title and action labels when provided', () => {
    render(
      <CancelConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        title="Salir del editor"
        subtitle="Confirmación previa"
        confirmText="Sí, salir"
        cancelText="Quedarse aquí"
      />
    );

    expect(screen.getByText('Salir del editor')).toBeInTheDocument();
    expect(screen.getByText('Confirmación previa')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sí, salir' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Quedarse aquí' })
    ).toBeInTheDocument();
  });
});
