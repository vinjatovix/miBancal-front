import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LocationLayoutTopBar, {
  type LocationLayoutTopBarProps
} from '../../../../../src/pages/locations/LocationLayoutPage/components/LocationLayoutTopBar';
import type { BedViewportState } from '../../../../../src/components/beds/visualizer/hooks/useBedViewport';
import { DEFAULT_ACTIVE_GRID_LAYERS } from '../../../../../src/components/beds/visualizer/utils/bedGridConfig';
import '../../../../../src/i18n/messages/beds';

function buildViewport(): BedViewportState {
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
    onPointerUp: vi.fn()
  } as unknown as BedViewportState;
}

function buildProps(
  overrides: Partial<LocationLayoutTopBarProps> = {}
): LocationLayoutTopBarProps {
  return {
    mode: 'read',
    onModeChange: vi.fn(),
    isPlanting: false,
    isPosition: false,
    toolMode: 'select',
    onSelectToolMode: vi.fn(),
    isSavingPlacement: false,
    hasPlantingChanges: false,
    pendingPlantingCount: 0,
    onSavePlanting: vi.fn(),
    onDiscardPlanting: vi.fn(),
    hasPositionChanges: false,
    isSavingPosition: false,
    onSavePosition: vi.fn(),
    onDiscardPosition: vi.fn(),
    gridSnapEnabled: false,
    onToggleGridSnap: vi.fn(),
    neighborSnapEnabled: false,
    onToggleNeighborSnap: vi.fn(),
    showBedNames: true,
    onToggleShowNames: vi.fn(),
    showDimensions: true,
    onToggleShowDimensions: vi.fn(),
    showPlants: true,
    onToggleShowPlants: vi.fn(),
    showCardinalOrientation: true,
    onToggleShowCardinalOrientation: vi.fn(),
    showGrids: true,
    onToggleGrids: vi.fn(),
    activeGridLayers: DEFAULT_ACTIVE_GRID_LAYERS,
    onToggleGridLayer: vi.fn(),
    viewport: buildViewport(),
    onFitToView: vi.fn(),
    onExportPdf: vi.fn(),
    ...overrides
  };
}

describe('LocationLayoutTopBar export action', () => {
  it('renders the export button', () => {
    render(<LocationLayoutTopBar {...buildProps()} />);

    expect(
      screen.getByRole('button', { name: 'Exportar a PDF' })
    ).toBeInTheDocument();
  });

  it('invokes the export callback on click', async () => {
    const onExportPdf = vi.fn();
    render(<LocationLayoutTopBar {...buildProps({ onExportPdf })} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Exportar a PDF' })
    );

    expect(onExportPdf).toHaveBeenCalledTimes(1);
  });

  it('disables the export button when requested', () => {
    render(<LocationLayoutTopBar {...buildProps({ exportDisabled: true })} />);

    expect(
      screen.getByRole('button', { name: 'Exportar a PDF' })
    ).toBeDisabled();
  });
});
