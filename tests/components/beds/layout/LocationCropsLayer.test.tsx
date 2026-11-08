import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LocationCropsLayer from '../../../../src/components/beds/layout/LocationCropsLayer';
import type { ResolvedBed } from '../../../../src/components/beds/layout/utils/layoutTypes';
import type { CropPlacementItem } from '../../../../src/types/PlantInstance/plantPlacementTypes';
import '../../../../src/i18n/messages/beds';

function buildCrop(
  overrides: Partial<CropPlacementItem> = {}
): CropPlacementItem {
  return {
    id: 'crop-1',
    bedId: 'bed-1',
    plantId: 'plant-1',
    commonName: 'Tomate',
    position: { x: 60, y: 40 },
    vitalRadius: 25,
    growthStatus: 'planted',
    version: 1,
    ...overrides
  };
}

function renderLayer(
  beds: readonly ResolvedBed[],
  cropsByBed: ReadonlyMap<string, readonly CropPlacementItem[]>
) {
  return render(
    <svg>
      <LocationCropsLayer beds={beds} cropsByBed={cropsByBed} />
    </svg>
  );
}

describe('LocationCropsLayer', () => {
  it('places a crop in the bed-local frame when width is the long side', () => {
    const bed: ResolvedBed = {
      id: 'bed-1',
      name: 'Tomates',
      width: 100,
      height: 50,
      position: { x: 10, y: 20 },
      rotation: 30
    };
    const { container } = renderLayer(
      [bed],
      new Map([['bed-1', [buildCrop()]]])
    );

    const bedGroup = container.querySelector('.location-crops-layer > g');
    expect(bedGroup?.getAttribute('transform')).toBe(
      'translate(10 20) rotate(30)'
    );
    const node = container.querySelector('.location-crops-layer__node');
    expect(node?.getAttribute('transform')).toBe('translate(60 40)');
    expect(
      container
        .querySelector('.location-crops-layer__radius')
        ?.getAttribute('r')
    ).toBe('25');
  });

  it('places a crop at its bed-local coordinates when height is the long side', () => {
    const bed: ResolvedBed = {
      id: 'bed-1',
      name: 'Tomates',
      width: 50,
      height: 100,
      position: { x: 0, y: 0 },
      rotation: 0
    };
    const { container } = renderLayer(
      [bed],
      new Map([['bed-1', [buildCrop()]]])
    );

    const node = container.querySelector('.location-crops-layer__node');
    expect(node?.getAttribute('transform')).toBe('translate(60 40)');
  });

  it('renders nothing for beds without crops', () => {
    const bed: ResolvedBed = {
      id: 'bed-1',
      name: 'Tomates',
      width: 100,
      height: 50,
      position: { x: 0, y: 0 },
      rotation: 0
    };
    const { container } = renderLayer([bed], new Map());

    expect(container.querySelector('.location-crops-layer__node')).toBeNull();
  });
});
