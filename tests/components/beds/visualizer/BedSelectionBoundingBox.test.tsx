import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BedSelectionBoundingBox } from '../../../../src/components/beds/visualizer/BedSelectionBoundingBox';
import type { GroupBoundingBox } from '../../../../src/types/PlantInstance/brushSelectionTypes';
import '../../../../src/i18n/messages/beds';

const SAMPLE_BOX: GroupBoundingBox = {
  minX: 20,
  minY: 30,
  maxX: 100,
  maxY: 120,
  width: 80,
  height: 90,
  center: { x: 60, y: 75 },
  count: 3
};

describe('BedSelectionBoundingBox', () => {
  it('renders null when boundingBox prop is null', () => {
    const { container } = render(
      <svg>
        <BedSelectionBoundingBox boundingBox={null} />
      </svg>
    );

    expect(
      container.querySelector('.bed-selection-bounding-box')
    ).not.toBeInTheDocument();
  });

  it('renders bounding rectangle with correct coordinates and dimensions', () => {
    const { container } = render(
      <svg>
        <BedSelectionBoundingBox boundingBox={SAMPLE_BOX} />
      </svg>
    );

    const rect = container.querySelector('.bed-selection-bounding-box__rect');
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute('x', '20');
    expect(rect).toHaveAttribute('y', '30');
    expect(rect).toHaveAttribute('width', '80');
    expect(rect).toHaveAttribute('height', '90');
  });

  it('renders count label showing number of selected plants', () => {
    const { container } = render(
      <svg>
        <BedSelectionBoundingBox boundingBox={SAMPLE_BOX} />
      </svg>
    );

    const label = container.querySelector('.bed-selection-bounding-box__label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('3 plantas seleccionadas');
  });

  it('applies is-conflict class when hasConflict is true', () => {
    const { container } = render(
      <svg>
        <BedSelectionBoundingBox boundingBox={SAMPLE_BOX} hasConflict />
      </svg>
    );

    const rect = container.querySelector('.bed-selection-bounding-box__rect');
    expect(rect).toHaveClass('is-conflict');
  });

  it('applies is-dragging class when isDraggingGroup is true', () => {
    const { container } = render(
      <svg>
        <BedSelectionBoundingBox boundingBox={SAMPLE_BOX} isDraggingGroup />
      </svg>
    );

    const rect = container.querySelector('.bed-selection-bounding-box__rect');
    expect(rect).toHaveClass('is-dragging');
  });
});
