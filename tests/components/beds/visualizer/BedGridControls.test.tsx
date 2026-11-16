import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import BedGridControls from '../../../../src/components/beds/visualizer/BedGridControls';
import type { BedGridLayerKey } from '../../../../src/components/beds/visualizer/utils/bedGridConfig';

describe('BedGridControls', () => {
  const layerCases: readonly {
    readonly key: BedGridLayerKey;
    readonly label: string;
  }[] = [
    { key: 'sfg', label: 'Malla SFG (30 × 30 cm)' },
    { key: 'intermediate', label: 'Submódulo (15 × 15 cm)' },
    { key: 'decimeters', label: 'Decímetros (10 × 10 cm)' },
    { key: 'fine', label: 'Malla fina (5 × 5 cm)' }
  ];

  it.each(layerCases)(
    'renders $label with correct aria-pressed state',
    ({ key, label }) => {
      const activeLayers = {
        sfg: key === 'sfg',
        intermediate: key === 'intermediate',
        decimeters: key === 'decimeters',
        fine: key === 'fine'
      };

      render(
        <BedGridControls activeLayers={activeLayers} onToggleLayer={vi.fn()} />
      );

      expect(screen.getByRole('button', { name: label })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    }
  );

  it.each(layerCases)(
    'invokes onToggleLayer with $key when $label button is clicked',
    async ({ key, label }) => {
      const user = userEvent.setup();
      const onToggleLayer = vi.fn();
      const activeLayers = {
        sfg: true,
        intermediate: false,
        decimeters: false,
        fine: false
      };

      render(
        <BedGridControls
          activeLayers={activeLayers}
          onToggleLayer={onToggleLayer}
        />
      );
      await user.click(screen.getByRole('button', { name: label }));

      expect(onToggleLayer).toHaveBeenCalledWith(key);
    }
  );
});
