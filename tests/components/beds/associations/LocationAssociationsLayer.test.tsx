import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LocationAssociationsLayer from '../../../../src/components/beds/associations/LocationAssociationsLayer';
import type { ActiveAssociationLink } from '../../../../src/components/beds/associations/types/cropAssociationTypes';
import { buildPlantRelation } from '../../../fixtures/plantRelations/buildPlantRelation';

function createMockLink(
  id: string,
  scope: 'intra_bed' | 'cross_bed',
  polarity: 'beneficial' | 'detrimental'
): ActiveAssociationLink {
  return {
    id,
    cropA: {
      id: `${id}-a`,
      plantId: 'plant-a',
      bedId: 'bed-1',
      commonName: 'Planta A',
      x: 100,
      y: 100,
      vitalRadius: 15
    },
    cropB: {
      id: `${id}-b`,
      plantId: 'plant-b',
      bedId: scope === 'cross_bed' ? 'bed-2' : 'bed-1',
      commonName: 'Planta B',
      x: 150,
      y: 100,
      vitalRadius: 15
    },
    distanceCm: 50,
    effectiveReachCm: 80,
    scope,
    relations: [
      buildPlantRelation({
        type: polarity,
        mechanism: polarity === 'beneficial' ? 'pest_repellent' : 'allelopathy'
      })
    ],
    visualPolarity: polarity,
    isWarningPriority: false,
    midpoint: { x: 125, y: 100 }
  };
}

describe('LocationAssociationsLayer', () => {
  it('renders cross-bed and intra-bed association lines', () => {
    const crossBedLink = createMockLink(
      'link-cross',
      'cross_bed',
      'beneficial'
    );
    const intraBedLink = createMockLink(
      'link-intra',
      'intra_bed',
      'detrimental'
    );

    render(
      <svg>
        <LocationAssociationsLayer
          links={[crossBedLink, intraBedLink]}
          filterMode="all"
        />
      </svg>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);

    const layer = document.querySelector('.location-associations-layer');
    expect(layer).toBeInTheDocument();
  });

  it('filters detrimental-only associations in location space', () => {
    const crossBedLink = createMockLink(
      'link-cross',
      'cross_bed',
      'beneficial'
    );
    const intraBedLink = createMockLink(
      'link-intra',
      'intra_bed',
      'detrimental'
    );

    render(
      <svg>
        <LocationAssociationsLayer
          links={[crossBedLink, intraBedLink]}
          filterMode="detrimental_only"
        />
      </svg>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(
      document.querySelector('.crop-association-line__visual--detrimental')
    ).toBeInTheDocument();
  });

  it('handles link selection on location canvas', async () => {
    const link = createMockLink('link-1', 'cross_bed', 'beneficial');
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <svg>
        <LocationAssociationsLayer links={[link]} onSelectLink={handleSelect} />
      </svg>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleSelect).toHaveBeenCalledWith(link);
  });

  it('renders empty layer container when links array is empty', () => {
    render(
      <svg>
        <LocationAssociationsLayer links={[]} />
      </svg>
    );

    const layer = document.querySelector('.location-associations-layer');
    expect(layer).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
