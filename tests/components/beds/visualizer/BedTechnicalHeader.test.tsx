import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import BedTechnicalHeader from '../../../../src/components/beds/visualizer/BedTechnicalHeader';
import { buildBed } from '../../../fixtures/beds/buildBed';

describe('BedTechnicalHeader', () => {
  it('renders bed name heading', () => {
    const bed = buildBed({ name: 'Bancal Tomates' });

    render(
      <MemoryRouter>
        <BedTechnicalHeader bed={bed} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Bancal Tomates' })
    ).toBeInTheDocument();
  });

  it('renders bed dimensions and substrate depth', () => {
    const bed = buildBed({ width: 120, height: 240, depth: 35 });

    render(
      <MemoryRouter>
        <BedTechnicalHeader bed={bed} />
      </MemoryRouter>
    );

    expect(screen.getByText('240 cm × 120 cm')).toBeInTheDocument();
    expect(screen.getByText('35 cm de sustrato')).toBeInTheDocument();
  });

  it('renders associated location name when present', () => {
    const bed = buildBed({
      location: {
        id: 'loc-1',
        name: 'Huerto Familiar',
        latitude: null,
        longitude: null
      }
    });

    render(
      <MemoryRouter>
        <BedTechnicalHeader bed={bed} />
      </MemoryRouter>
    );

    expect(screen.getByText('Huerto Familiar')).toBeInTheDocument();
  });

  it('renders accessible fallback label when location is absent', () => {
    const bed = buildBed({ location: null, locationId: null });

    render(
      <MemoryRouter>
        <BedTechnicalHeader bed={bed} />
      </MemoryRouter>
    );

    expect(screen.getByText('Sin ubicación asignada')).toBeInTheDocument();
  });

  it('renders back link navigation pointing to beds list', () => {
    const bed = buildBed();

    render(
      <MemoryRouter>
        <BedTechnicalHeader bed={bed} />
      </MemoryRouter>
    );

    const backLink = screen.getByRole('link', {
      name: 'Volver a mis bancales'
    });
    expect(backLink).toHaveAttribute('href', '/beds');
  });

  it('links to the location spatial layout when the bed has a location', () => {
    const bed = buildBed({ locationId: 'loc-1' });

    render(
      <MemoryRouter>
        <BedTechnicalHeader bed={bed} />
      </MemoryRouter>
    );

    const layoutLink = screen.getByRole('link', {
      name: 'Ver la disposición de la localización'
    });
    expect(layoutLink).toHaveAttribute('href', '/locations/loc-1/layout');
  });

  it('omits the layout link when the bed has no location', () => {
    const bed = buildBed({ location: null, locationId: null });

    render(
      <MemoryRouter>
        <BedTechnicalHeader bed={bed} />
      </MemoryRouter>
    );

    expect(
      screen.queryByRole('link', {
        name: 'Ver la disposición de la localización'
      })
    ).toBeNull();
  });
});
