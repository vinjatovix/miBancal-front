import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutGestureHelpSheet from '../../../../../src/pages/locations/LocationLayoutPage/components/LayoutGestureHelpSheet';

describe('LayoutGestureHelpSheet', () => {
  it('does not render when closed', () => {
    render(<LayoutGestureHelpSheet isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the gesture cheat sheet as a dialog with every gesture', () => {
    render(<LayoutGestureHelpSheet isOpen onClose={vi.fn()} />);
    expect(
      screen.getByRole('dialog', { name: 'Cómo manejar el plano con gestos' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Toca un elemento para seleccionarlo')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mantén pulsado y arrastra para mover')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Pellizca con dos dedos para hacer zoom')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Arrastra con dos dedos para desplazar')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Arrastra en vacío para seleccionar un grupo')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Arrastra para sembrar siguiendo el trazo')
    ).toBeInTheDocument();
  });

  it('closes when pressing Escape', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<LayoutGestureHelpSheet isOpen onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
