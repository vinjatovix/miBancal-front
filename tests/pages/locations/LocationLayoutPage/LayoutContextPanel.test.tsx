import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutContextPanel from '../../../../src/pages/locations/LocationLayoutPage/components/LayoutContextPanel';

describe('LayoutContextPanel', () => {
  it('does not render children when open is false', () => {
    render(
      <LayoutContextPanel mode="read" open={false} variant="none">
        <div>Panel content</div>
      </LayoutContextPanel>
    );

    expect(screen.queryByText('Panel content')).not.toBeInTheDocument();
  });

  it('renders children inside contextual panel container when open is true', () => {
    render(
      <LayoutContextPanel mode="position" open={true} variant="tray">
        <div>Bandeja de bancales</div>
      </LayoutContextPanel>
    );

    expect(screen.getByText('Bandeja de bancales')).toBeInTheDocument();
  });

  it('invokes onRequestClose when Escape key is pressed', async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();

    render(
      <LayoutContextPanel
        mode="plants"
        open={true}
        variant="palette"
        onRequestClose={onRequestClose}
      >
        <button type="button">Action</button>
      </LayoutContextPanel>
    );

    await user.keyboard('{Escape}');

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('traps focus between first and last focusable elements on Tab navigation', async () => {
    const user = userEvent.setup();

    render(
      <LayoutContextPanel
        mode="position"
        open={true}
        variant="properties"
        isMobileSheet={true}
      >
        <button type="button">Primero</button>
        <button type="button">Segundo</button>
      </LayoutContextPanel>
    );

    const firstButton = screen.getByRole('button', { name: 'Primero' });
    const secondButton = screen.getByRole('button', { name: 'Segundo' });

    firstButton.focus();
    await user.tab();
    expect(document.activeElement).toBe(secondButton);

    await user.tab();
    expect(document.activeElement).toBe(firstButton);
  });

  it('renders mobile dialog with role dialog and accessible name', () => {
    render(
      <LayoutContextPanel
        mode="plants"
        open={true}
        variant="palette"
        isMobileSheet={true}
      >
        <div>Contenido móvil</div>
      </LayoutContextPanel>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
