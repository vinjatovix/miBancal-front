import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ManualPlacementModal from '../../../../src/components/beds/visualizer/ManualPlacementModal';
import '../../../../src/i18n/messages/beds';

function renderModal(
  overrides: Partial<React.ComponentProps<typeof ManualPlacementModal>> = {}
) {
  const props = {
    isOpen: true,
    bedWidth: 200,
    bedHeight: 100,
    vitalRadius: 15,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    ...overrides
  };
  render(<ManualPlacementModal {...props} />);
  return props;
}

describe('ManualPlacementModal', () => {
  it('rejects coordinates outside the bed boundaries', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderModal({ onConfirm });

    await user.type(screen.getByLabelText('Coordenada X (cm)'), '-5');
    await user.type(screen.getByLabelText('Coordenada Y (cm)'), '50');
    await user.click(screen.getByRole('button', { name: 'Sembrar' }));

    expect(
      screen.getByText('Las coordenadas deben estar dentro del bancal.')
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('rejects a position that collides with an existing crop', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderModal({
      onConfirm,
      evaluatePlacement: () => ({ hasCollision: true, isOutOfBounds: false })
    });

    await user.type(screen.getByLabelText('Coordenada X (cm)'), '50');
    await user.type(screen.getByLabelText('Coordenada Y (cm)'), '50');
    await user.click(screen.getByRole('button', { name: 'Sembrar' }));

    expect(
      screen.getByText('Esa posición colisiona con otro cultivo. Elige otra.')
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('confirms a valid free position with its coordinates', async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    renderModal({
      onConfirm,
      evaluatePlacement: () => ({ hasCollision: false, isOutOfBounds: false })
    });

    await user.type(screen.getByLabelText('Coordenada X (cm)'), '50');
    await user.type(screen.getByLabelText('Coordenada Y (cm)'), '40');
    await user.click(screen.getByRole('button', { name: 'Sembrar' }));

    expect(onConfirm).toHaveBeenCalledWith({ x: 50, y: 40 });
  });
});
