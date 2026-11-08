import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BedVisualizerCanvas from '../../../../src/components/beds/visualizer/BedVisualizerCanvas';
import { DEFAULT_ACTIVE_GRID_LAYERS } from '../../../../src/components/beds/visualizer/utils/bedGridConfig';
import { buildBed } from '../../../fixtures/beds/buildBed';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import '../../../../src/i18n/messages/beds';

const bed = buildBed({ width: 100, height: 200 });
const crop = buildCropPlacementItem({
  id: 'crop-1',
  commonName: 'Tomate',
  position: { x: 60, y: 40 }
});

function renderCanvas(onMoveCrop = vi.fn()) {
  render(
    <BedVisualizerCanvas
      bed={bed}
      activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
      crops={[crop]}
      collisions={[]}
      perimeterWarnings={new Set()}
      onMoveCrop={onMoveCrop}
    />
  );
  return onMoveCrop;
}

describe('BedVisualizerCanvas accessibility', () => {
  it('exposes each crop as a focusable button labelled with its coordinates', () => {
    renderCanvas();

    const node = screen.getByRole('button', {
      name: 'Tomate en 60, 40 centímetros'
    });
    expect(node).toHaveAttribute('tabindex', '0');
  });

  it('moves a crop 1 cm with an arrow key', () => {
    const onMoveCrop = renderCanvas();

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Tomate en 60, 40 centímetros' }),
      { key: 'ArrowUp' }
    );

    expect(onMoveCrop).toHaveBeenCalledWith('crop-1', { x: 60, y: 39 });
  });

  it('moves a crop 10 cm with shift and an arrow key', () => {
    const onMoveCrop = renderCanvas();

    fireEvent.keyDown(
      screen.getByRole('button', { name: 'Tomate en 60, 40 centímetros' }),
      { key: 'ArrowRight', shiftKey: true }
    );

    expect(onMoveCrop).toHaveBeenCalledWith('crop-1', { x: 70, y: 40 });
  });

  it('renders a polite live region for placement announcements', () => {
    renderCanvas();

    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('triggers toggle selection when pressing Shift + Space on a crop in select mode', () => {
    const onToggleCropSelection = vi.fn();

    render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="select"
        crops={[crop]}
        onToggleCropSelection={onToggleCropSelection}
      />
    );

    const node = screen.getByRole('button', {
      name: 'Tomate en 60, 40 centímetros'
    });
    fireEvent.keyDown(node, { key: ' ', shiftKey: true });

    expect(onToggleCropSelection).toHaveBeenCalledWith('crop-1');
  });

  it('clears selection when Escape key is pressed', () => {
    const onClearSelection = vi.fn();

    render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        activeToolMode="select"
        crops={[crop]}
        selectedCropIds={new Set(['crop-1'])}
        onClearSelection={onClearSelection}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClearSelection).toHaveBeenCalled();
  });
});
