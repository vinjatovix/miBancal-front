import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutViewportControls from '../../../../src/components/beds/layout/LayoutViewportControls';
import type { BedViewportState } from '../../../../src/components/beds/visualizer/hooks/useBedViewport';

function buildViewport(
  overrides: Partial<BedViewportState> = {}
): BedViewportState {
  return {
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    zoomPercent: 100,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
    fitToBounds: vi.fn(),
    panBy: vi.fn(),
    animateTo: vi.fn(),
    compensateWidthChange: vi.fn(),
    onPointerDown: vi.fn(),
    onPointerMove: vi.fn(),
    onPointerUp: vi.fn(),
    onWheel: vi.fn(),
    ...overrides
  };
}

describe('LayoutViewportControls', () => {
  it.each([
    ['Acercar', 'zoomIn'],
    ['Alejar', 'zoomOut'],
    ['Centrar y restablecer el zoom', 'resetZoom']
  ] as const)(
    'invokes %s action when button is clicked',
    async (buttonName, action) => {
      const viewport = buildViewport();
      const user = userEvent.setup();

      render(<LayoutViewportControls viewport={viewport} />);

      await user.click(screen.getByRole('button', { name: buttonName }));

      expect(viewport[action]).toHaveBeenCalledTimes(1);
    }
  );

  it('displays the visible zoom percentage', () => {
    const viewport = buildViewport({ zoomPercent: 125 });

    render(<LayoutViewportControls viewport={viewport} />);

    expect(screen.getByText('125%')).toBeInTheDocument();
  });

  it('invokes onFitToView callback when fit button is clicked', async () => {
    const viewport = buildViewport();
    const onFitToView = vi.fn();
    const user = userEvent.setup();

    render(
      <LayoutViewportControls viewport={viewport} onFitToView={onFitToView} />
    );

    await user.click(
      screen.getByRole('button', { name: 'Centrar y restablecer el zoom' })
    );

    expect(onFitToView).toHaveBeenCalledTimes(1);
  });
});
