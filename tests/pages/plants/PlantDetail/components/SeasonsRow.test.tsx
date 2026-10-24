import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import SeasonsRow from '../../../../../src/pages/plants/PlantDetail/components/SeasonsRow';

describe('SeasonsRow', () => {
  it.each([[undefined], [[]]])('renders nothing for %j', (seasons) => {
    const { container } = render(<SeasonsRow seasons={seasons} />);

    expect(container).toBeEmptyDOMElement();
  });

  it.each([
    [['summer', 'spring'], 'Primavera, Verano'],
    [['winter'], 'Invierno'],
    [['spring', 'spring', 'autumn'], 'Primavera, Otoño'],
    [['spring', 'monsoon'], 'Primavera, monsoon']
  ])('renders %j as "%s"', (seasons, expected) => {
    render(<SeasonsRow seasons={seasons} />);

    expect(screen.getByText(/Estación/)).toBeInTheDocument();
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
