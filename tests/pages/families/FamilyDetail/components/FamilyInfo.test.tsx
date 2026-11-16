import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import FamilyInfo from '../../../../../src/pages/families/FamilyDetail/components/FamilyInfo';
import { buildFamily } from '../../../../fixtures/families/buildFamily';

describe('FamilyInfo component', () => {
  it('renders description section with clean heading and description icon', () => {
    const family = buildFamily({
      shortDescription: 'Familia botánica de prueba'
    });

    const { container } = render(<FamilyInfo family={family} />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Descripción'
    });
    const content = screen.getByText('Familia botánica de prueba');
    const svg = container.querySelector('svg');

    expect(heading).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(svg).toBeInTheDocument();
  });

  it('renders highlights section with clean heading and auto_awesome icon', () => {
    const family = buildFamily({
      highlights: ['Hábito trepador', 'Fruto en baya']
    });

    render(<FamilyInfo family={family} />);

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Destacados'
    });
    const firstHighlight = screen.getByText('Hábito trepador');
    const secondHighlight = screen.getByText('Fruto en baya');

    expect(heading).toBeInTheDocument();
    expect(firstHighlight).toBeInTheDocument();
    expect(secondHighlight).toBeInTheDocument();
  });
});
