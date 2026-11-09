import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CropAssociationLine from '../../../../src/components/beds/associations/CropAssociationLine';
import type { ActiveAssociationLink } from '../../../../src/components/beds/associations/types/cropAssociationTypes';
import { buildPlantRelation } from '../../../fixtures/plantRelations/buildPlantRelation';

function createMockLink(
  overrides: Partial<ActiveAssociationLink> = {}
): ActiveAssociationLink {
  return {
    id: 'crop-1:crop-2',
    cropA: {
      id: 'crop-1',
      plantId: 'plant-tomato',
      bedId: 'bed-1',
      commonName: 'Tomate',
      x: 50,
      y: 50,
      vitalRadius: 20
    },
    cropB: {
      id: 'crop-2',
      plantId: 'plant-basil',
      bedId: 'bed-1',
      commonName: 'Albahaca',
      x: 80,
      y: 50,
      vitalRadius: 15
    },
    distanceCm: 30,
    effectiveReachCm: 80,
    scope: 'intra_bed',
    relations: [
      buildPlantRelation({
        type: 'beneficial',
        mechanism: 'pest_repellent'
      })
    ],
    visualPolarity: 'beneficial',
    isWarningPriority: false,
    midpoint: { x: 65, y: 50 },
    ...overrides
  };
}

describe('CropAssociationLine', () => {
  it('renders beneficial association with continuous stroke and accessible label', () => {
    const link = createMockLink({ visualPolarity: 'beneficial' });

    render(
      <svg>
        <CropAssociationLine link={link} />
      </svg>
    );

    const button = screen.getByRole('button', {
      name: /asociación simbiótica entre tomate y albahaca, a 30 cm/i
    });
    expect(button).toBeInTheDocument();

    const visualLine = document.querySelector(
      '.crop-association-line__visual--beneficial'
    );
    expect(visualLine).toBeInTheDocument();
    expect(visualLine).toHaveAttribute('x1', '50');
    expect(visualLine).toHaveAttribute('y1', '50');
    expect(visualLine).toHaveAttribute('x2', '80');
    expect(visualLine).toHaveAttribute('y2', '50');
  });

  it('renders detrimental association with dashed stroke and midpoint warning glyph', () => {
    const link = createMockLink({
      visualPolarity: 'detrimental',
      relations: [
        buildPlantRelation({
          type: 'detrimental',
          mechanism: 'allelopathy'
        })
      ]
    });

    render(
      <svg>
        <CropAssociationLine link={link} />
      </svg>
    );

    const visualLine = document.querySelector(
      '.crop-association-line__visual--detrimental'
    );
    expect(visualLine).toBeInTheDocument();
    expect(visualLine).toHaveAttribute('stroke-dasharray', '6 4');

    const warningGlyph = document.querySelector(
      '.crop-association-line__warning-glyph'
    );
    expect(warningGlyph).toBeInTheDocument();
  });

  it('renders expanded 24px invisible hit target', () => {
    const link = createMockLink();

    render(
      <svg>
        <CropAssociationLine link={link} />
      </svg>
    );

    const hitTarget = document.querySelector(
      '.crop-association-line__hit-target'
    );
    expect(hitTarget).toBeInTheDocument();
    expect(hitTarget).toHaveAttribute('stroke-width', '24');
  });

  it('calls onSelect when hit target is clicked', async () => {
    const link = createMockLink();
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <svg>
        <CropAssociationLine link={link} onSelect={handleSelect} />
      </svg>
    );

    await user.click(screen.getByRole('button'));

    expect(handleSelect).toHaveBeenCalledWith(link);
  });

  it.each(['{Enter}', ' '])(
    'calls onSelect when hit target is activated via %s key',
    async (key) => {
      const link = createMockLink();
      const handleSelect = vi.fn();
      const user = userEvent.setup();

      render(
        <svg>
          <CropAssociationLine link={link} onSelect={handleSelect} />
        </svg>
      );

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard(key);

      expect(handleSelect).toHaveBeenCalledWith(link);
    }
  );

  it('does not call onSelect when non-activation key like Escape is pressed', async () => {
    const link = createMockLink();
    const handleSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <svg>
        <CropAssociationLine link={link} onSelect={handleSelect} />
      </svg>
    );

    const button = screen.getByRole('button');
    button.focus();
    await user.keyboard('{Escape}');

    expect(handleSelect).not.toHaveBeenCalled();
  });

  it('renders warning priority label when isWarningPriority is true', () => {
    const link = createMockLink({
      visualPolarity: 'detrimental',
      isWarningPriority: true
    });

    render(
      <svg>
        <CropAssociationLine link={link} />
      </svg>
    );

    expect(
      screen.getByRole('button', {
        name: /incompatibilidad con efectos mixtos entre tomate y albahaca/i
      })
    ).toBeInTheDocument();
  });
});
