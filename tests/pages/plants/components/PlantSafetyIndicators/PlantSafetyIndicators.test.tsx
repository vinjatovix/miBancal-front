import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import PlantSafetyIndicators from '../../../../../src/pages/plants/components/PlantSafetyIndicators/PlantSafetyIndicators';
import type { PlantSafety } from '../../../../../src/pages/plants/utils/plantSafety';

function safety(overrides: Partial<PlantSafety>): PlantSafety {
  return { edible: 'unknown', toxic: 'unknown', hasData: true, ...overrides };
}

describe('PlantSafetyIndicators', () => {
  it.each([
    ['Comestible', { edible: 'yes' as const }],
    ['Tóxica', { toxic: 'yes' as const }]
  ])('shows an accessible %s indicator', (name, overrides) => {
    render(<PlantSafetyIndicators safety={safety(overrides)} />);

    const indicator = screen.getByRole('img', { name });
    const svg = indicator.querySelector('svg');

    expect(indicator).toHaveAttribute('title', name);
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toBeInTheDocument();
    expect(indicator).not.toHaveTextContent(name);
  });

  it('shows edible before toxic', () => {
    render(
      <PlantSafetyIndicators safety={safety({ edible: 'yes', toxic: 'yes' })} />
    );

    expect(
      screen.getAllByRole('img').map((img) => img.getAttribute('aria-label'))
    ).toEqual(['Comestible', 'Tóxica']);
  });

  it.each([[{}], [{ edible: 'no' as const, toxic: 'no' as const }]])(
    'renders nothing for %j',
    (overrides) => {
      const { container } = render(
        <PlantSafetyIndicators safety={safety(overrides)} />
      );

      expect(container).toBeEmptyDOMElement();
    }
  );
});
