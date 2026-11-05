import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import PlantSafety from '../../../../../src/pages/plants/PlantDetail/components/PlantSafety';
import type { PlantSafety as Safety } from '../../../../../src/pages/plants/utils/plantSafety';

function renderSafety(overrides: Partial<Safety>) {
  return render(
    <PlantSafety
      safety={{
        edible: 'unknown',
        toxic: 'unknown',
        hasData: true,
        ...overrides
      }}
    />
  );
}

function rowOf(label: string) {
  return screen.getByText(label, { selector: 'strong' }).closest('div');
}

describe('PlantSafety', () => {
  it.each([
    ['yes', 'yes', 'Sí', 'Sí'],
    ['yes', 'no', 'Sí', 'No'],
    ['unknown', 'unknown', 'Sin dato', 'Sin dato'],
    ['unknown', 'yes', 'Sin dato', 'Sí']
  ] as const)(
    'shows edible %s and toxic %s',
    (edible, toxic, edibleText, toxicText) => {
      renderSafety({ edible, toxic });

      expect(
        screen.getByRole('heading', { name: 'Comestibilidad y toxicidad' })
      ).toBeInTheDocument();
      expect(rowOf('Comestible')).toHaveTextContent(edibleText);
      expect(rowOf('Tóxica')).toHaveTextContent(toxicText);
    }
  );

  it('highlights the toxic row when the plant is toxic', () => {
    renderSafety({ toxic: 'yes' });

    expect(rowOf('Tóxica')).toHaveClass('plant-safety__row--warning');
    expect(rowOf('Comestible')).not.toHaveClass('plant-safety__row--warning');
  });

  it('does not highlight a non toxic plant', () => {
    renderSafety({ toxic: 'no' });

    expect(rowOf('Tóxica')).not.toHaveClass('plant-safety__row--warning');
  });

  it('shows notes as plain text even without the toxic flag', () => {
    renderSafety({ toxicityNotes: 'Raíz <b>x</b> tóxica' });

    expect(screen.getByText('Notas de toxicidad')).toBeInTheDocument();
    expect(screen.getByText('Raíz <b>x</b> tóxica')).toBeInTheDocument();
  });

  it('does not show the notes title without notes', () => {
    renderSafety({ edible: 'yes' });

    expect(screen.queryByText('Notas de toxicidad')).not.toBeInTheDocument();
  });

  it('links to the PFAF source', () => {
    renderSafety({ edible: 'yes' });

    const link = screen.getByRole('link', { name: 'Plants For A Future' });

    expect(link).toHaveAttribute('href', 'https://pfaf.org');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders nothing without data', () => {
    const { container } = render(
      <PlantSafety
        safety={{ edible: 'unknown', toxic: 'unknown', hasData: false }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
