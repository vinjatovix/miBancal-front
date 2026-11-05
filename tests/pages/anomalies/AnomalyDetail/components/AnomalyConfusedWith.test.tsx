import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AnomalyConfusedWith } from '../../../../../src/pages/anomalies/AnomalyDetail/components/AnomalyConfusedWith';

describe('AnomalyConfusedWith', () => {
  it('returns null when slugs is undefined', () => {
    const { container } = render(<AnomalyConfusedWith slugs={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('returns null when slugs array is empty', () => {
    const { container } = render(<AnomalyConfusedWith slugs={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders section title and differential diagnosis links', () => {
    const slugs = ['pulgon-negro', 'mosca-blanca'];

    render(
      <MemoryRouter>
        <AnomalyConfusedWith slugs={slugs} />
      </MemoryRouter>
    );

    const title = screen.getByText('Diagnóstico diferencial');
    const firstLink = screen.getByRole('link', { name: /Pulgon Negro/i });
    const secondLink = screen.getByRole('link', { name: /Mosca Blanca/i });

    expect(title).toBeInTheDocument();
    expect(firstLink).toHaveAttribute('href', '/anomalies/pulgon-negro');
    expect(secondLink).toHaveAttribute('href', '/anomalies/mosca-blanca');
  });

  it('formats hyphenated slugs into readable capitalized labels', () => {
    const slugs = ['cochinilla-algodonosa-del-citrico'];

    render(
      <MemoryRouter>
        <AnomalyConfusedWith slugs={slugs} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', {
      name: 'Cochinilla Algodonosa Del Citrico'
    });

    expect(link).toBeInTheDocument();
  });
});
