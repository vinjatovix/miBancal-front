import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BedVisualizerCanvas from '../../../../src/components/beds/visualizer/BedVisualizerCanvas';
import { DEFAULT_ACTIVE_GRID_LAYERS } from '../../../../src/components/beds/visualizer/utils/bedGridConfig';
import { buildBed } from '../../../fixtures/beds/buildBed';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import '../../../../src/i18n/messages/beds';

const bed = buildBed({ width: 100, height: 200 });

function dataTransferStub() {
  return {
    dropEffect: '',
    effectAllowed: '',
    setData: vi.fn(),
    getData: vi.fn(() => 'plant-tomato')
  };
}

describe('BedVisualizerCanvas collisions', () => {
  it('renders collision halos on crops reported as conflicting', () => {
    const cropA = buildCropPlacementItem({
      id: 'a',
      position: { x: 60, y: 40 }
    });
    const cropB = buildCropPlacementItem({
      id: 'b',
      position: { x: 75, y: 40 }
    });

    const { container } = render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        crops={[cropA, cropB]}
        collisions={[
          { cropIdA: 'a', cropIdB: 'b', distance: 15, requiredDistance: 40 }
        ]}
        perimeterWarnings={new Set()}
      />
    );

    expect(
      container.querySelectorAll('.bed-crop-node--collision')
    ).toHaveLength(2);
  });

  it('renders an amber overflow halo on perimeter warnings', () => {
    const crop = buildCropPlacementItem({ id: 'a' });

    const { container } = render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        crops={[crop]}
        collisions={[]}
        perimeterWarnings={new Set(['a'])}
      />
    );

    expect(
      container.querySelector('.bed-crop-node--overflow')
    ).toBeInTheDocument();
  });

  it('blocks a drop in a colliding position without emitting a placement', () => {
    const onDropPlacement = vi.fn();
    const onAttemptInvalidPlacement = vi.fn();

    const { container } = render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        crops={[]}
        collisions={[]}
        perimeterWarnings={new Set()}
        placingPlant={{ commonName: 'Tomate', vitalRadius: 25 }}
        evaluatePlacement={() => ({ hasCollision: true, isOutOfBounds: false })}
        onDropPlacement={onDropPlacement}
        onAttemptInvalidPlacement={onAttemptInvalidPlacement}
      />
    );

    const svg = screen.getByRole('img');
    const dataTransfer = dataTransferStub();

    fireEvent.dragOver(svg, { clientX: 100, clientY: 100, dataTransfer });
    expect(
      container.querySelector('.bed-crop-node--preview')
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '.bed-crop-node--preview.bed-crop-node--collision'
      )
    ).toBeInTheDocument();

    fireEvent.drop(svg, { clientX: 100, clientY: 100, dataTransfer });

    expect(onDropPlacement).not.toHaveBeenCalled();
    expect(onAttemptInvalidPlacement).toHaveBeenCalledWith('collision');
  });

  it('allows a drop in a free position emitting the placement', () => {
    const onDropPlacement = vi.fn();

    render(
      <BedVisualizerCanvas
        bed={bed}
        activeLayers={DEFAULT_ACTIVE_GRID_LAYERS}
        crops={[]}
        collisions={[]}
        perimeterWarnings={new Set()}
        placingPlant={{ commonName: 'Tomate', vitalRadius: 25 }}
        evaluatePlacement={() => ({
          hasCollision: false,
          isOutOfBounds: false
        })}
        onDropPlacement={onDropPlacement}
      />
    );

    const svg = screen.getByRole('img');
    const dataTransfer = dataTransferStub();

    fireEvent.drop(svg, { clientX: 100, clientY: 100, dataTransfer });

    expect(onDropPlacement).toHaveBeenCalledTimes(1);
  });
});
