import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LayoutBedCardinalEdgeLabels from '../../../../src/components/beds/layout/LayoutBedCardinalEdgeLabels';
import type { BedEdgeCardinals } from '../../../../src/components/beds/layout/utils/cardinalGeometry';

const DEFAULT_CARDINALS: BedEdgeCardinals = {
  top: 'N',
  right: 'E',
  bottom: 'S',
  left: 'O'
};

describe('LayoutBedCardinalEdgeLabels', () => {
  it('renders four cardinal pill badges with letters N, E, S, and O', () => {
    const { container } = render(
      <svg>
        <LayoutBedCardinalEdgeLabels
          width={120}
          height={60}
          cardinals={DEFAULT_CARDINALS}
          zoom={1}
        />
      </svg>
    );

    const badges = container.querySelectorAll(
      '.layout-bed-cardinal-labels__badge'
    );
    expect(badges).toHaveLength(4);
    expect(
      container.querySelector('.layout-bed-cardinal-labels__text--top')
        ?.textContent
    ).toBe('N');
    expect(
      container.querySelector('.layout-bed-cardinal-labels__text--right')
        ?.textContent
    ).toBe('E');
    expect(
      container.querySelector('.layout-bed-cardinal-labels__text--bottom')
        ?.textContent
    ).toBe('S');
    expect(
      container.querySelector('.layout-bed-cardinal-labels__text--left')
        ?.textContent
    ).toBe('O');
  });

  it('includes accessible labels for all four cardinal edges', () => {
    const { container } = render(
      <svg>
        <LayoutBedCardinalEdgeLabels
          width={120}
          height={60}
          cardinals={DEFAULT_CARDINALS}
          zoom={1}
        />
      </svg>
    );

    expect(
      container.querySelector('[aria-label="Lado orientado al Norte"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[aria-label="Lado orientado al Este"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[aria-label="Lado orientado al Sur"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('[aria-label="Lado orientado al Oeste"]')
    ).toBeInTheDocument();
  });

  it('positions the badges at top, right, bottom, and left centers', () => {
    const { container } = render(
      <svg>
        <LayoutBedCardinalEdgeLabels
          width={120}
          height={60}
          cardinals={DEFAULT_CARDINALS}
          zoom={1}
        />
      </svg>
    );

    const topBadge = container.querySelector(
      '.layout-bed-cardinal-labels__badge--top'
    );
    const rightBadge = container.querySelector(
      '.layout-bed-cardinal-labels__badge--right'
    );
    const bottomBadge = container.querySelector(
      '.layout-bed-cardinal-labels__badge--bottom'
    );
    const leftBadge = container.querySelector(
      '.layout-bed-cardinal-labels__badge--left'
    );

    expect(topBadge?.getAttribute('transform')).toContain('translate(60, -10)');
    expect(rightBadge?.getAttribute('transform')).toContain(
      'translate(130, 30)'
    );
    expect(bottomBadge?.getAttribute('transform')).toContain(
      'translate(60, 70)'
    );
    expect(leftBadge?.getAttribute('transform')).toContain(
      'translate(-10, 30)'
    );
  });

  it('applies compact class when rendered dimensions on screen are below 32px', () => {
    const { container } = render(
      <svg>
        <LayoutBedCardinalEdgeLabels
          width={50}
          height={20}
          cardinals={DEFAULT_CARDINALS}
          zoom={0.5}
        />
      </svg>
    );

    const rootGroup = container.querySelector('.layout-bed-cardinal-labels');
    expect(rootGroup).toHaveClass('layout-bed-cardinal-labels--compact');
  });

  it('does not apply compact class when dimensions on screen are at or above 32px', () => {
    const { container } = render(
      <svg>
        <LayoutBedCardinalEdgeLabels
          width={100}
          height={80}
          cardinals={DEFAULT_CARDINALS}
          zoom={1}
        />
      </svg>
    );

    const rootGroup = container.querySelector('.layout-bed-cardinal-labels');
    expect(rootGroup).not.toHaveClass('layout-bed-cardinal-labels--compact');
  });

  it('renders dynamic cardinal letters according to the provided cardinals prop', () => {
    const rotatedCardinals: BedEdgeCardinals = {
      top: 'E',
      right: 'S',
      bottom: 'O',
      left: 'N'
    };

    const { container } = render(
      <svg>
        <LayoutBedCardinalEdgeLabels
          width={120}
          height={60}
          cardinals={rotatedCardinals}
          zoom={1}
        />
      </svg>
    );

    expect(
      container.querySelector('.layout-bed-cardinal-labels__text--top')
        ?.textContent
    ).toBe('E');
    expect(
      container.querySelector('.layout-bed-cardinal-labels__text--right')
        ?.textContent
    ).toBe('S');
    expect(
      container.querySelector('.layout-bed-cardinal-labels__text--bottom')
        ?.textContent
    ).toBe('O');
    expect(
      container.querySelector('.layout-bed-cardinal-labels__text--left')
        ?.textContent
    ).toBe('N');
  });
});
