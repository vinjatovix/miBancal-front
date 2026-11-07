import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BedDimensionLines from '../../../../src/components/beds/visualizer/BedDimensionLines';
import { calculateBedGeometry } from '../../../../src/components/beds/visualizer/utils/bedGeometry';

describe('BedDimensionLines', () => {
  it('renders top width dimension label with centimeter units', () => {
    const geometry = calculateBedGeometry({ width: 120, height: 240 });

    render(
      <svg>
        <BedDimensionLines geometry={geometry} />
      </svg>
    );

    expect(screen.getByText('120 cm')).toBeInTheDocument();
  });

  it('renders left height dimension label with centimeter units', () => {
    const geometry = calculateBedGeometry({ width: 120, height: 240 });

    render(
      <svg>
        <BedDimensionLines geometry={geometry} />
      </svg>
    );

    expect(screen.getByText('240 cm')).toBeInTheDocument();
  });

  it('renders dimension lines and extension lines inside SVG group', () => {
    const geometry = calculateBedGeometry({ width: 120, height: 240 });

    const { container } = render(
      <svg>
        <BedDimensionLines geometry={geometry} />
      </svg>
    );

    const group = container.querySelector('.bed-dimension-lines');
    expect(group).toBeInTheDocument();
    expect(group?.querySelectorAll('line').length).toBeGreaterThanOrEqual(4);
  });
});
