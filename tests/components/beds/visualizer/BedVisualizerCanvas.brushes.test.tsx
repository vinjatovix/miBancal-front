import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import BedVisualizerCanvas from '../../../../src/components/beds/visualizer/BedVisualizerCanvas';
import { DEFAULT_ACTIVE_GRID_LAYERS } from '../../../../src/components/beds/visualizer/utils/bedGridConfig';
import type { PlantPlacementInput } from '../../../../src/types/PlantInstance/brushSelectionTypes';
import { buildBed } from '../../../fixtures/beds/buildBed';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import '../../../../src/i18n/messages/beds';

const BED = buildBed({ width: 100, height: 200 });

const TOMATO: PlantPlacementInput = {
  plantId: 'tomato-1',
  commonName: 'Tomate',
  scientificName: 'Solanum lycopersicum',
  spacingCmMin: 30
};

describe('BedVisualizerCanvas brushes integration', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 1000,
      height: 500,
      right: 1000,
      bottom: 500,
      x: 0,
      y: 0,
      toJSON: () => {}
    });
  });

  it('notifies user when drawing brush without active plant selection', () => {
    const onAnnounce = vi.fn();

    render(
      <BedVisualizerCanvas
        bed={BED}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="brush"
        activeBrushPattern="single-row"
        activePlantPlacement={null}
        onAnnounce={onAnnounce}
      />
    );

    const svg = screen.getByRole('img');
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, button: 0 });

    expect(onAnnounce).toHaveBeenCalledWith(
      'Selecciona primero una planta del catálogo para usar las brochas de siembra'
    );
  });

  it('draws single-row brush stroke and renders ghost preview and triggers onApplyBrush', () => {
    const onApplyBrush = vi.fn();
    const onAnnounce = vi.fn();

    const { container } = render(
      <BedVisualizerCanvas
        bed={BED}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="brush"
        activeBrushPattern="single-row"
        activePlantPlacement={TOMATO}
        onApplyBrush={onApplyBrush}
        onAnnounce={onAnnounce}
      />
    );

    const svg = screen.getByRole('img');

    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(svg, { clientX: 500, clientY: 100 });

    expect(
      container.querySelector('.bed-brush-preview-layer')
    ).toBeInTheDocument();
    expect(
      container.querySelectorAll('.bed-brush-preview-layer__candidate').length
    ).toBeGreaterThan(0);

    fireEvent.pointerUp(svg, { clientX: 500, clientY: 100 });

    expect(onApplyBrush).toHaveBeenCalledTimes(1);
    expect(onAnnounce).toHaveBeenCalled();
  });

  it('cancels preview when Escape key is pressed during stroke', () => {
    const onApplyBrush = vi.fn();

    const { container } = render(
      <BedVisualizerCanvas
        bed={BED}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="brush"
        activeBrushPattern="single-row"
        activePlantPlacement={TOMATO}
        onApplyBrush={onApplyBrush}
      />
    );

    const svg = screen.getByRole('img');
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(svg, { clientX: 400, clientY: 100 });

    expect(
      container.querySelector('.bed-brush-preview-layer')
    ).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(
      container.querySelector('.bed-brush-preview-layer')
    ).not.toBeInTheDocument();

    fireEvent.pointerUp(svg, { clientX: 400, clientY: 100 });
    expect(onApplyBrush).not.toHaveBeenCalled();
  });

  it('announces short stroke when drawn segment is shorter than plant spacing', () => {
    const onAnnounce = vi.fn();

    render(
      <BedVisualizerCanvas
        bed={BED}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="brush"
        activeBrushPattern="single-row"
        activePlantPlacement={TOMATO}
        onAnnounce={onAnnounce}
      />
    );

    const svg = screen.getByRole('img');
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(svg, { clientX: 101, clientY: 100 });
    fireEvent.pointerUp(svg, { clientX: 101, clientY: 100 });

    expect(onAnnounce).toHaveBeenCalledWith(
      'Trazo demasiado corto para el marco de la planta (30 cm)'
    );
  });

  it('omits conflicting positions and notifies accessible summary', () => {
    const onApplyBrush = vi.fn();
    const onAnnounce = vi.fn();
    const existingCrop = buildCropPlacementItem({
      id: 'existing-1',
      position: { x: 50, y: 50 },
      vitalRadius: 15
    });

    render(
      <BedVisualizerCanvas
        bed={BED}
        crops={[existingCrop]}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="brush"
        activeBrushPattern="double-row"
        activePlantPlacement={TOMATO}
        onApplyBrush={onApplyBrush}
        onAnnounce={onAnnounce}
      />
    );

    const svg = screen.getByRole('img');
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(svg, { clientX: 600, clientY: 100 });
    fireEvent.pointerUp(svg, { clientX: 600, clientY: 100 });

    expect(onApplyBrush).toHaveBeenCalled();
    expect(onAnnounce).toHaveBeenCalled();
  });

  it('draws staggered-triangle brush stroke and applies equilateral triangle positions', () => {
    const onApplyBrush = vi.fn();
    const onAnnounce = vi.fn();

    render(
      <BedVisualizerCanvas
        bed={BED}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="brush"
        activeBrushPattern="staggered-triangle"
        activePlantPlacement={TOMATO}
        onApplyBrush={onApplyBrush}
        onAnnounce={onAnnounce}
      />
    );

    const svg = screen.getByRole('img');
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, button: 0 });
    fireEvent.pointerMove(svg, { clientX: 500, clientY: 100 });
    fireEvent.pointerUp(svg, { clientX: 500, clientY: 100 });

    expect(onApplyBrush).toHaveBeenCalledTimes(1);
    expect(onAnnounce).toHaveBeenCalled();

    const placedItems = onApplyBrush.mock.calls[0][0];
    expect(placedItems.length).toBeGreaterThan(1);
  });

  it('selects crops inside marquee box when dragging in select mode', () => {
    const onSelectCropIds = vi.fn();
    const crop1 = buildCropPlacementItem({
      id: 'c1',
      position: { x: 50, y: 50 }
    });
    const crop2 = buildCropPlacementItem({
      id: 'c2',
      position: { x: 80, y: 50 }
    });

    const { container } = render(
      <BedVisualizerCanvas
        bed={BED}
        crops={[crop1, crop2]}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="select"
        onSelectCropIds={onSelectCropIds}
      />
    );

    const svg = screen.getByRole('img');
    fireEvent.pointerDown(svg, { clientX: 20, clientY: 20, button: 0 });
    fireEvent.pointerMove(svg, { clientX: 400, clientY: 300 });

    expect(
      container.querySelector('.bed-canvas__marquee-rect')
    ).toBeInTheDocument();
    expect(onSelectCropIds).toHaveBeenCalled();

    fireEvent.pointerUp(svg, { clientX: 400, clientY: 300 });
    expect(
      container.querySelector('.bed-canvas__marquee-rect')
    ).not.toBeInTheDocument();
  });

  it('toggles selection when Shift + clicking an individual crop', () => {
    const onToggleCropSelection = vi.fn();
    const crop = buildCropPlacementItem({
      id: 'c1',
      position: { x: 50, y: 50 }
    });

    render(
      <BedVisualizerCanvas
        bed={BED}
        crops={[crop]}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="select"
        onToggleCropSelection={onToggleCropSelection}
      />
    );

    const cropButton = screen.getByRole('button', {
      name: new RegExp(crop.commonName, 'i')
    });
    fireEvent.click(cropButton, { shiftKey: true });

    expect(onToggleCropSelection).toHaveBeenCalledWith('c1');
  });

  it('renders group bounding box when multiple crops are selected', () => {
    const crop1 = buildCropPlacementItem({
      id: 'c1',
      position: { x: 40, y: 40 }
    });
    const crop2 = buildCropPlacementItem({
      id: 'c2',
      position: { x: 80, y: 40 }
    });

    const { container } = render(
      <BedVisualizerCanvas
        bed={BED}
        crops={[crop1, crop2]}
        selectedCropIds={new Set(['c1', 'c2'])}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="select"
      />
    );

    expect(
      container.querySelector('.bed-selection-bounding-box')
    ).toBeInTheDocument();
    expect(
      container.querySelector('.bed-selection-bounding-box__label')
    ).toHaveTextContent('2 plantas seleccionadas');
  });
});
