import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BedGridLayers from '../../../../src/components/beds/visualizer/BedGridLayers';
import type { BedGridLayerKey } from '../../../../src/components/beds/visualizer/utils/bedGridConfig';

describe('BedGridLayers', () => {
  const layerCases: readonly {
    readonly key: BedGridLayerKey;
    readonly expectedStep: string;
  }[] = [
    { key: 'sfg', expectedStep: '30' },
    { key: 'intermediate', expectedStep: '15' },
    { key: 'decimeters', expectedStep: '10' },
    { key: 'fine', expectedStep: '5' }
  ];

  it.each(layerCases)(
    'renders $key pattern with step $expectedStep when active',
    ({ key, expectedStep }) => {
      const activeLayers = {
        sfg: key === 'sfg',
        intermediate: key === 'intermediate',
        decimeters: key === 'decimeters',
        fine: key === 'fine'
      };

      const { container } = render(
        <svg>
          <BedGridLayers width={120} height={240} activeLayers={activeLayers} />
        </svg>
      );

      const pattern = container.querySelector(`#grid-pattern-${key}`);
      expect(pattern).toBeInTheDocument();
      expect(pattern?.getAttribute('width')).toBe(expectedStep);
      expect(pattern?.getAttribute('height')).toBe(expectedStep);
    }
  );

  it('renders multiple superimposed patterns when several layers are active', () => {
    const activeLayers = {
      sfg: true,
      intermediate: true,
      decimeters: true,
      fine: true
    };

    const { container } = render(
      <svg>
        <BedGridLayers width={120} height={240} activeLayers={activeLayers} />
      </svg>
    );

    expect(container.querySelector('#grid-pattern-sfg')).toBeInTheDocument();
    expect(
      container.querySelector('#grid-pattern-intermediate')
    ).toBeInTheDocument();
    expect(
      container.querySelector('#grid-pattern-decimeters')
    ).toBeInTheDocument();
    expect(container.querySelector('#grid-pattern-fine')).toBeInTheDocument();
  });
});
