import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import BedAssociationsLayer from '../../../../src/components/beds/associations/BedAssociationsLayer';
import type { ActiveAssociationLink } from '../../../../src/components/beds/associations/types/cropAssociationTypes';
import { buildPlantRelation } from '../../../fixtures/plantRelations/buildPlantRelation';

function createMockLink(
  id: string,
  polarity: 'beneficial' | 'detrimental'
): ActiveAssociationLink {
  return {
    id,
    cropA: {
      id: `${id}-a`,
      plantId: 'plant-a',
      bedId: 'bed-1',
      commonName: 'Planta A',
      x: 20,
      y: 20,
      vitalRadius: 15
    },
    cropB: {
      id: `${id}-b`,
      plantId: 'plant-b',
      bedId: 'bed-1',
      commonName: 'Planta B',
      x: 60,
      y: 20,
      vitalRadius: 15
    },
    distanceCm: 40,
    effectiveReachCm: 80,
    scope: 'intra_bed',
    relations: [
      buildPlantRelation({
        type: polarity,
        mechanism: polarity === 'beneficial' ? 'pest_repellent' : 'allelopathy'
      })
    ],
    visualPolarity: polarity,
    isWarningPriority: false,
    midpoint: { x: 40, y: 20 }
  };
}

describe('BedAssociationsLayer', () => {
  it('renders all links when filterMode is all', () => {
    const beneficial = createMockLink('link-1', 'beneficial');
    const detrimental = createMockLink('link-2', 'detrimental');

    render(
      <svg>
        <BedAssociationsLayer
          links={[beneficial, detrimental]}
          filterMode="all"
        />
      </svg>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('filters out beneficial links when filterMode is detrimental_only', () => {
    const beneficial = createMockLink('link-1', 'beneficial');
    const detrimental = createMockLink('link-2', 'detrimental');

    render(
      <svg>
        <BedAssociationsLayer
          links={[beneficial, detrimental]}
          filterMode="detrimental_only"
        />
      </svg>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(
      document.querySelector('.crop-association-line__visual--detrimental')
    ).toBeInTheDocument();
    expect(
      document.querySelector('.crop-association-line__visual--beneficial')
    ).not.toBeInTheDocument();
  });

  it('renders empty layer container when links array is empty', () => {
    render(
      <svg>
        <BedAssociationsLayer links={[]} />
      </svg>
    );

    const layer = document.querySelector('.bed-associations-layer');
    expect(layer).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('propagates link selection on interaction', async () => {
    const link = createMockLink('link-1', 'beneficial');
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <svg>
        <BedAssociationsLayer links={[link]} onSelectLink={handleSelect} />
      </svg>
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleSelect).toHaveBeenCalledWith(link);
  });
});
