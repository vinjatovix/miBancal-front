import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import LocationLayoutWorkspace, {
  type LocationLayoutWorkspaceProps
} from '../../../../../src/pages/locations/LocationLayoutPage/components/LocationLayoutWorkspace';
import type { LayersPopoverButtonProps } from '../../../../../src/components/beds/visualizer/LayersPopoverButton';
import { DEFAULT_ACTIVE_GRID_LAYERS } from '../../../../../src/components/beds/visualizer/utils/bedGridConfig';

vi.mock(
  '../../../../../src/components/beds/layout/LocationLayoutCanvas',
  () => ({
    default: () => <div data-testid="mock-canvas" />
  })
);

function buildLayersProps(): LayersPopoverButtonProps {
  return {
    showNames: true,
    onToggleNames: vi.fn(),
    showDimensions: true,
    onToggleDimensions: vi.fn(),
    showPlants: true,
    onTogglePlants: vi.fn(),
    showCardinalOrientation: false,
    onToggleCardinalOrientation: vi.fn(),
    showGrids: false,
    onToggleGrids: vi.fn(),
    activeGridLayers: DEFAULT_ACTIVE_GRID_LAYERS,
    onToggleGridLayer: vi.fn()
  };
}

function buildProps(
  overrides: Partial<LocationLayoutWorkspaceProps> = {}
): LocationLayoutWorkspaceProps {
  const { editor: editorOverride, ...restOverrides } = overrides;

  const editor = {
    mode: 'read',
    placedBeds: [],
    viewBox: '0 0 1000 1000',
    selectedId: null,
    selectBed: vi.fn(),
    moveBed: vi.fn(),
    beginBedDrag: vi.fn(),
    moveBedDrag: vi.fn(),
    endBedDrag: vi.fn(),
    rotateBedBy: vi.fn(),
    unplaceSelected: vi.fn(),
    dirty: false,
    saving: false,
    canUndo: false,
    canRedo: false,
    save: vi.fn(),
    promptDiscard: vi.fn(),
    gridSnapEnabled: false,
    toggleGridSnap: vi.fn(),
    neighborSnapEnabled: false,
    toggleNeighborSnap: vi.fn(),
    ...editorOverride
  };

  return {
    canvasContainerRef: { current: null },
    editor: editor as unknown as LocationLayoutWorkspaceProps['editor'],
    viewport: {
      zoom: 1,
      pan: { x: 0, y: 0 },
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      resetZoom: vi.fn()
    } as unknown as LocationLayoutWorkspaceProps['viewport'],
    visibility: {
      activeGridLayers: DEFAULT_ACTIVE_GRID_LAYERS,
      showBedNames: true,
      showDimensions: true,
      effectiveNorthAngle: 0,
      showCardinalOrientation: false,
      showPlants: true,
      bedAzimuth: 0,
      handleBedRotationChange: vi.fn(),
      setCalibratedNorth: vi.fn(),
      handleSaveNorth: vi.fn(),
      isSavingNorth: false
    } as unknown as LocationLayoutWorkspaceProps['visibility'],
    placement: {
      preview: null,
      selectedCropId: null,
      selectedCropIds: new Set<string>(),
      toolMode: 'select',
      brush: {
        directrix: null,
        candidates: [],
        isDrawing: false,
        strokeBedId: null,
        handlePointerDown: vi.fn(),
        handlePointerMove: vi.fn(),
        handlePointerUp: vi.fn()
      },
      marquee: {
        boundingBox: null,
        boundingBoxBedId: null,
        marqueeBox: null,
        marqueeBedId: null,
        groupMovePreview: null,
        handleCropClick: vi.fn(),
        handlePointerDown: vi.fn(),
        handlePointerMove: vi.fn(),
        handlePointerUp: vi.fn()
      },
      updateDropPreview: vi.fn(),
      clearPreview: vi.fn(),
      dropPlant: vi.fn(),
      tapPlace: vi.fn(),
      selectCrop: vi.fn(),
      beginCropDrag: vi.fn(),
      moveCropDrag: vi.fn(),
      endCropDrag: vi.fn()
    } as unknown as LocationLayoutWorkspaceProps['placement'],
    bedActions: {
      handleDeselectBed: vi.fn(),
      setIsEditOpen: vi.fn(),
      setIsDeleteOpen: vi.fn()
    } as unknown as LocationLayoutWorkspaceProps['bedActions'],
    layout: {
      location: {
        id: 'loc-1',
        name: 'Huerto Central',
        width: 1000,
        height: 1000,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      beds: []
    } as unknown as LocationLayoutWorkspaceProps['layout'],
    cropsByBed: new Map(),
    selectedBedId: null,
    isMobile: false,
    isFullscreen: false,
    onToggleFullscreen: vi.fn(),
    onFitToView: vi.fn(),
    layersProps: buildLayersProps(),
    ...restOverrides
  };
}

describe('LocationLayoutWorkspace responsive tool layout', () => {
  it('renders mobile save actions and stacks floating dock above them in mobile edit mode', () => {
    render(
      <LocationLayoutWorkspace
        {...buildProps({
          isMobile: true,
          editor: {
            mode: 'position'
          } as unknown as LocationLayoutWorkspaceProps['editor']
        })}
      />
    );

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Descartar' })
    ).toBeInTheDocument();

    const dock = screen.getByRole('toolbar', { name: 'Controles del lienzo' });
    expect(dock).toHaveClass('layout-floating-tool-dock--stacked');
  });

  it('hides mobile save actions and does not stack floating dock in mobile read mode', () => {
    render(
      <LocationLayoutWorkspace
        {...buildProps({
          isMobile: true,
          editor: {
            mode: 'read'
          } as unknown as LocationLayoutWorkspaceProps['editor']
        })}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Guardar' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Descartar' })
    ).not.toBeInTheDocument();

    const dock = screen.getByRole('toolbar', { name: 'Controles del lienzo' });
    expect(dock).not.toHaveClass('layout-floating-tool-dock--stacked');
  });

  it('does not render mobile save actions and does not stack floating dock on desktop', () => {
    render(
      <LocationLayoutWorkspace
        {...buildProps({
          isMobile: false,
          editor: {
            mode: 'position'
          } as unknown as LocationLayoutWorkspaceProps['editor']
        })}
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Guardar' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Descartar' })
    ).not.toBeInTheDocument();

    const dock = screen.getByRole('toolbar', { name: 'Controles del lienzo' });
    expect(dock).not.toHaveClass('layout-floating-tool-dock--stacked');
  });
});
