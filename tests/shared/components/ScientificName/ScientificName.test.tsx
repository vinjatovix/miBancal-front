import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ScientificName from '../../../../src/shared/components/ScientificName/ScientificName';

describe('ScientificName', () => {
  it('renders the name unchanged in a secondary span by default', () => {
    render(<ScientificName>Solanum lycopersicum</ScientificName>);

    const name = screen.getByText('Solanum lycopersicum');

    expect(name.tagName).toBe('SPAN');
    expect(name).toHaveClass('scientific-name');
    expect(name).not.toHaveClass('scientific-name--title');
  });

  it('adds the title modifier with the title variant', () => {
    render(<ScientificName variant="title">Solanaceae</ScientificName>);

    expect(screen.getByText('Solanaceae')).toHaveClass(
      'scientific-name',
      'scientific-name--title'
    );
  });

  it('adds no role nor aria attributes', () => {
    render(<ScientificName>Vicia faba</ScientificName>);

    const name = screen.getByText('Vicia faba');
    const ariaAttributes = name
      .getAttributeNames()
      .filter(
        (attribute) => attribute === 'role' || attribute.startsWith('aria-')
      );

    expect(ariaAttributes).toEqual([]);
  });
});
