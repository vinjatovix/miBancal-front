import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import PlantHero from '../../../../../src/pages/plants/PlantDetail/components/PlantHero';
import { capitalizeFirstLetter } from '../../../../../src/shared/utils/capitalizeFirstLetter';
import { buildFamilySummary } from '../../../../fixtures/families/buildFamilySummary';
import {
  buildPlant,
  buildPlantWithFamily
} from '../../../../fixtures/plants/buildPlant';

describe('PlantHero: linked family', () => {
  it('renders family name as a link pointing to the family slug', () => {
    const family = buildFamilySummary({
      id: '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf',
      name: 'Solanáceas',
      slug: 'solanaceae'
    });
    const plant = buildPlantWithFamily(family);

    render(
      <MemoryRouter>
        <PlantHero plant={plant} />
      </MemoryRouter>
    );

    const familyLink = screen.getByRole('link', { name: 'Solanáceas' });
    expect(familyLink).toHaveAttribute('href', '/families/solanaceae');
  });

  it('does not expose the raw family id in the link or text', () => {
    const familyId = '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf';
    const family = buildFamilySummary({
      id: familyId,
      name: 'Solanáceas',
      slug: 'solanaceae'
    });
    const plant = buildPlantWithFamily(family);

    render(
      <MemoryRouter>
        <PlantHero plant={plant} />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: 'Solanáceas' });
    expect(link).not.toHaveAttribute('href', expect.stringContaining(familyId));
    expect(
      screen.queryByText(new RegExp(familyId, 'i'))
    ).not.toBeInTheDocument();
  });
});

describe('PlantHero: unavailable and missing family', () => {
  it.each([
    [
      'renders unavailable badge text',
      () =>
        expect(screen.getByText('Familia no disponible')).toBeInTheDocument()
    ],
    [
      'does not render a link',
      () => expect(screen.queryByRole('link')).not.toBeInTheDocument()
    ],
    [
      'does not render a button',
      () => expect(screen.queryByRole('button')).not.toBeInTheDocument()
    ],
    [
      'does not expose the raw family id',
      () =>
        expect(
          screen.queryByText(/5a2380c4-1546-4511-a77b-ec9d3ebcb7cf/i)
        ).not.toBeInTheDocument()
    ]
  ])('%s when family is unavailable', (_, assertFn) => {
    const plant = buildPlantWithFamily('5a2380c4-1546-4511-a77b-ec9d3ebcb7cf');

    render(
      <MemoryRouter>
        <PlantHero plant={plant} />
      </MemoryRouter>
    );

    assertFn();
  });

  it('renders no family badge when family is missing', () => {
    const basePlant = buildPlantWithFamily(
      '5a2380c4-1546-4511-a77b-ec9d3ebcb7cf'
    );
    const plant = {
      ...basePlant,
      identity: {
        ...basePlant.identity,
        family: undefined as unknown as string
      }
    };

    render(
      <MemoryRouter>
        <PlantHero plant={plant} />
      </MemoryRouter>
    );

    expect(screen.queryByText('Familia no disponible')).not.toBeInTheDocument();
  });
});

describe('PlantHero: scientific name', () => {
  it('styles only the scientific name value, not its label', () => {
    const plant = buildPlant();

    render(
      <MemoryRouter>
        <PlantHero plant={plant} />
      </MemoryRouter>
    );

    expect(
      screen.getByText(capitalizeFirstLetter(plant.identity.scientificName!))
    ).toHaveClass('scientific-name');
    expect(
      screen.getByText('Nombre científico', { exact: false })
    ).not.toHaveClass('scientific-name');
  });
});

describe('PlantHero: image', () => {
  it('renders the primary image sent by the API', () => {
    const plant = buildPlant({
      image: { url: 'https://example.org/plants/primary.jpg' }
    });

    render(
      <MemoryRouter>
        <PlantHero plant={plant} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('img', { name: plant.identity.name.primary })
    ).toHaveAttribute('src', 'https://example.org/plants/primary.jpg');
  });
});
