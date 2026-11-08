import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import LocationPlacementLayer from '../../../../src/components/beds/layout/LocationPlacementLayer';
import type { ResolvedBed } from '../../../../src/components/beds/layout/utils/layoutTypes';
import type { CropPlacementItem } from '../../../../src/types/PlantInstance/plantPlacementTypes';
import '../../../../src/i18n/messages/beds';

const bed: ResolvedBed = {
  id: 'bed-1',
  name: 'B1',
  width: 90,
  height: 600,
  position: { x: 10, y: 20 },
  rotation: 90
};

const crop: CropPlacementItem = {
  id: 'crop-1',
  bedId: 'bed-1',
  plantId: 'plant-1',
  commonName: 'Acedera',
  position: { x: 45, y: 300 },
  vitalRadius: 12.5,
  growthStatus: 'planted',
  version: 1
};

function renderLayer(
  props: Partial<React.ComponentProps<typeof LocationPlacementLayer>> = {}
) {
  return render(
    <svg>
      <LocationPlacementLayer
        beds={[bed]}
        cropsByBed={new Map([['bed-1', [crop]]])}
        selectedCropId={null}
        preview={null}
        onSelectCrop={vi.fn()}
        onCropPointerDown={vi.fn()}
        onCropPointerMove={vi.fn()}
        onCropPointerUp={vi.fn()}
        {...props}
      />
    </svg>
  );
}

describe('LocationPlacementLayer', () => {
  it('renders each crop at its bed-local position', () => {
    const { container } = renderLayer();
    const node = container.querySelector('.location-placement-layer__node');
    expect(node?.getAttribute('transform')).toBe('translate(45 300)');
  });

  it('selects a crop on click without bubbling to the canvas', () => {
    const onSelectCrop = vi.fn();
    const { getByRole } = renderLayer({ onSelectCrop });
    fireEvent.click(getByRole('button'));
    expect(onSelectCrop).toHaveBeenCalledWith('crop-1');
  });

  it('marks the selected crop node', () => {
    const { container } = renderLayer({ selectedCropId: 'crop-1' });
    expect(
      container.querySelector('.location-placement-layer__node--selected')
    ).toBeInTheDocument();
  });

  it('renders an invalid preview with the collision modifier', () => {
    const { container } = renderLayer({
      preview: {
        bedId: 'bed-1',
        local: { x: 20, y: 100 },
        vitalRadius: 12.5,
        commonName: 'Acedera',
        hasCollision: true,
        isOutOfBounds: false
      }
    });
    expect(
      container.querySelector('.location-placement-layer__preview--collision')
    ).toBeInTheDocument();
  });

  it('only renders bounding box on the bed matching boundingBoxBedId', () => {
    const secondBed: ResolvedBed = {
      id: 'bed-2',
      name: 'B2',
      width: 90,
      height: 600,
      position: { x: 200, y: 20 },
      rotation: 0
    };
    const boundingBox = {
      minX: 10,
      minY: 10,
      maxX: 50,
      maxY: 50,
      width: 40,
      height: 40,
      center: { x: 30, y: 30 },
      count: 1
    };

    const { container } = renderLayer({
      beds: [bed, secondBed],
      cropsByBed: new Map([
        ['bed-1', [crop]],
        ['bed-2', []]
      ]),
      boundingBox,
      boundingBoxBedId: 'bed-1'
    });

    const bed1Group = container.querySelector(
      '[transform*="translate(10 20)"]'
    );

    const boundingBoxes = container.querySelectorAll(
      '.bed-selection-bounding-box'
    );
    expect(boundingBoxes).toHaveLength(1);
    expect(
      bed1Group?.querySelector('.bed-selection-bounding-box')
    ).toBeInTheDocument();
  });

  it('does not render bounding box when boundingBoxBedId is null', () => {
    const boundingBox = {
      minX: 10,
      minY: 10,
      maxX: 50,
      maxY: 50,
      width: 40,
      height: 40,
      center: { x: 30, y: 30 },
      count: 1
    };

    const { container } = renderLayer({
      boundingBox,
      boundingBoxBedId: null
    });

    expect(container.querySelector('.bed-selection-bounding-box')).toBeNull();
  });
});
