import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import BedCard from '../../../src/components/beds/BedCard/BedCard';
import '../../../src/i18n/messages/beds';
import { buildBed } from '../../fixtures/beds/buildBed';

describe('BedCard', () => {
  it('renders bed name and dimensions correctly', () => {
    const bed = buildBed({
      name: 'Bancal Tomates',
      width: 100,
      height: 200,
      depth: 40
    });

    render(
      <MemoryRouter>
        <BedCard bed={bed} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Bancal Tomates' })
    ).toBeInTheDocument();
    expect(screen.getByText('200 × 100 × 40 cm')).toBeInTheDocument();
  });

  it('renders location badge when bed has an associated location', () => {
    const bed = buildBed({
      location: {
        id: 'loc-1',
        name: 'Huerto Sur'
      }
    });

    render(
      <MemoryRouter>
        <BedCard bed={bed} />
      </MemoryRouter>
    );

    expect(screen.getByText('Huerto Sur')).toBeInTheDocument();
  });

  it('renders fallback label when bed has no location', () => {
    const bed = buildBed({
      location: null
    });

    render(
      <MemoryRouter>
        <BedCard bed={bed} />
      </MemoryRouter>
    );

    expect(screen.getByText('Sin ubicación asignada')).toBeInTheDocument();
  });

  it('links to the bed detail route with proper accessibility label', () => {
    const bed = buildBed({
      id: 'bed-123',
      name: 'Bancal Aromáticas'
    });

    render(
      <MemoryRouter>
        <BedCard bed={bed} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', {
      name: 'Ver bancal Bancal Aromáticas'
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/beds/bed-123');
  });
});
