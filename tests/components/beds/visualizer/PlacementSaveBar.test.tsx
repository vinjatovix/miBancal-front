import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import PlacementSaveBar from '../../../../src/components/beds/visualizer/PlacementSaveBar';
import '../../../../src/i18n/messages/beds';

describe('PlacementSaveBar', () => {
  it('renders nothing when there are no pending changes', () => {
    const { container } = render(
      <PlacementSaveBar
        isDirty={false}
        isSaving={false}
        pendingCount={0}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('shows a singular pending badge and triggers save on click', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <PlacementSaveBar
        isDirty
        isSaving={false}
        pendingCount={1}
        onSave={onSave}
        onDiscard={vi.fn()}
      />
    );

    expect(screen.getByText('1 cambio pendiente')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Guardar distribución' })
    );

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('shows a plural pending badge for multiple changes', () => {
    render(
      <PlacementSaveBar
        isDirty
        isSaving={false}
        pendingCount={3}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />
    );

    expect(screen.getByText('3 cambios pendientes')).toBeInTheDocument();
  });

  it('disables actions while saving', () => {
    render(
      <PlacementSaveBar
        isDirty
        isSaving
        pendingCount={2}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Descartar cambios' })
    ).toBeDisabled();
  });
});
