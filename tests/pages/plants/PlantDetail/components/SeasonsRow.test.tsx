import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import SeasonsRow from '../../../../../src/pages/plants/PlantDetail/components/SeasonsRow';
import { reportMissingTranslation } from '../../../../../src/shared/observability/reportMissingTranslation';

vi.mock(
  '../../../../../src/shared/observability/reportMissingTranslation',
  () => ({
    reportMissingTranslation: vi.fn()
  })
);

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

  it('reports missing translation when season key is unknown', () => {
    vi.mocked(reportMissingTranslation).mockClear();

    render(<SeasonsRow seasons={['spring', 'monsoon']} />);

    expect(reportMissingTranslation).toHaveBeenCalled();
  });
});
