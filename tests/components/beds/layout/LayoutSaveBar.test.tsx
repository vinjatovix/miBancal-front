import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutSaveBar from '../../../../src/components/beds/layout/LayoutSaveBar';

describe('LayoutSaveBar', () => {
  it('disables both actions when there are no changes', () => {
    render(
      <LayoutSaveBar
        dirty={false}
        saving={false}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Guardar disposición' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Descartar cambios' })
    ).toBeDisabled();
  });

  it('invokes onSave when save button is clicked while dirty', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <LayoutSaveBar dirty saving={false} onSave={onSave} onDiscard={vi.fn()} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Guardar disposición' })
    );

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('invokes onDiscard when discard button is clicked while dirty', async () => {
    const onDiscard = vi.fn();
    const user = userEvent.setup();

    render(
      <LayoutSaveBar
        dirty
        saving={false}
        onSave={vi.fn()}
        onDiscard={onDiscard}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Descartar cambios' }));

    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('shows the saving label while saving', () => {
    render(<LayoutSaveBar dirty saving onSave={vi.fn()} onDiscard={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Guardando...' })).toBeDisabled();
  });

  it('does not render an undo action when no undo handler is provided', () => {
    render(
      <LayoutSaveBar dirty saving={false} onSave={vi.fn()} onDiscard={vi.fn()} />
    );

    expect(
      screen.queryByRole('button', { name: 'Deshacer' })
    ).not.toBeInTheDocument();
  });

  it('disables the undo action when there is nothing to undo', () => {
    render(
      <LayoutSaveBar
        dirty
        saving={false}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        canUndo={false}
        onUndo={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Deshacer' })).toBeDisabled();
  });

  it('invokes onUndo when the undo button is clicked', async () => {
    const onUndo = vi.fn();
    const user = userEvent.setup();

    render(
      <LayoutSaveBar
        dirty
        saving={false}
        onSave={vi.fn()}
        onDiscard={vi.fn()}
        canUndo
        onUndo={onUndo}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Deshacer' }));

    expect(onUndo).toHaveBeenCalledTimes(1);
  });
});
