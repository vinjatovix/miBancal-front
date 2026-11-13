import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BedCropsLayer from '../../../../src/components/beds/visualizer/BedCropsLayer';
import { buildCropPlacementItem } from '../../../fixtures/plantInstances/buildPlantInstance';
import '../../../../src/i18n/messages/beds';

function renderLayer(ui: React.ReactNode) {
  return render(<svg>{ui}</svg>);
}

describe('BedCropsLayer', () => {
  it('renders a crop node with its species name and vital radius circle', () => {
    const crop = buildCropPlacementItem({ id: 'crop-1', commonName: 'Tomate' });

    const { container } = renderLayer(
      <BedCropsLayer
        crops={[crop]}
        collisions={[]}
        perimeterWarnings={new Set()}
      />
    );

    expect(screen.getByText('Tomate')).toBeInTheDocument();
    expect(container.querySelectorAll('.bed-crop-node__radius')).toHaveLength(
      1
    );
    expect(container.querySelectorAll('.bed-crop-node__center')).toHaveLength(
      1
    );
  });

  it('exposes crop nodes as focusable buttons grouped in an accessible layer', () => {
    const crop = buildCropPlacementItem({ id: 'crop-1', commonName: 'Tomate' });

    renderLayer(
      <BedCropsLayer
        crops={[crop]}
        collisions={[]}
        perimeterWarnings={new Set()}
      />
    );

    expect(
      screen.getByRole('group', { name: 'Cultivos sembrados en el bancal' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('tabindex', '0');
  });

  it('renders a non-interactive preview node in addition to placed crops', () => {
    const crop = buildCropPlacementItem({ id: 'crop-1' });

    const { container } = renderLayer(
      <BedCropsLayer
        crops={[crop]}
        collisions={[]}
        perimeterWarnings={new Set()}
        preview={{
          position: { x: 10, y: 10 },
          vitalRadius: 15,
          commonName: 'Lechuga',
          hasCollision: false,
          isOutOfBounds: false
        }}
      />
    );

    expect(container.querySelectorAll('.bed-crop-node__radius')).toHaveLength(
      2
    );
    expect(container.querySelector('.bed-crop-node--preview')).toBeTruthy();
  });
});
