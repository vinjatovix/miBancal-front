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
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    resetZoom: vi.fn(),
    panBy: vi.fn(),
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
});
