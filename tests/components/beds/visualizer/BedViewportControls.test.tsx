import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import BedViewportControls from '../../../../src/components/beds/visualizer/BedViewportControls';

describe('BedViewportControls', () => {
  it('triggers onZoomIn when zoom in button is clicked', async () => {
    const user = userEvent.setup();
    const onZoomIn = vi.fn();

    render(
      <BedViewportControls
        onZoomIn={onZoomIn}
        onZoomOut={vi.fn()}
        onReset={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Acercar' }));

    expect(onZoomIn).toHaveBeenCalledTimes(1);
  });

  it('triggers onZoomOut when zoom out button is clicked', async () => {
    const user = userEvent.setup();
    const onZoomOut = vi.fn();

    render(
      <BedViewportControls
        onZoomIn={vi.fn()}
        onZoomOut={onZoomOut}
        onReset={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Alejar' }));

    expect(onZoomOut).toHaveBeenCalledTimes(1);
  });

  it('triggers onReset when fit screen button is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();

    render(
      <BedViewportControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onReset={onReset}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Ajustar al centro' }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('triggers onToggleFullscreen when fullscreen button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleFullscreen = vi.fn();

    render(
      <BedViewportControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onReset={vi.fn()}
        onToggleFullscreen={onToggleFullscreen}
        isFullscreen={false}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Pantalla completa' }));

    expect(onToggleFullscreen).toHaveBeenCalledTimes(1);
  });

  it('displays exit fullscreen label when currently in fullscreen', () => {
    render(
      <BedViewportControls
        onZoomIn={vi.fn()}
        onZoomOut={vi.fn()}
        onReset={vi.fn()}
        onToggleFullscreen={vi.fn()}
        isFullscreen={true}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Salir de pantalla completa' })
    ).toBeInTheDocument();
  });
});
