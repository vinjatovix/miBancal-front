import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { useLocation } from 'react-router-dom';

import { listPlantsResponse } from '../../../fixtures/plants/listPlants';
import PlantCard from '../../../../src/pages/plants/PlantCard/PlantCard';
import { getBookmarkedPlantIds } from '../../../../src/services/bookmarks.service';
import { capitalizeFirstLetter } from '../../../../src/shared/utils/capitalizeFirstLetter';
import { clearStoredToken } from '../../../../src/shared/auth/session';
import type {
  Plant,
  PlantEcologicalTraits
} from '../../../../src/types/Plants/Plant';
import {
  buildPlantListItem,
  buildPlantListItemWithEcological
} from '../../../fixtures/plants/buildPlantListItem';
import { VALID_TEST_TOKEN } from '../../../fixtures/auth/authFixtures';
import { renderWithProviders } from '../../../test-utils/renderWithProviders';

vi.mock('../../../../src/services/bookmarks.service', () => ({
  getBookmarkedPlantIds: vi.fn()
}));

const mockedGetBookmarkedPlantIds = vi.mocked(getBookmarkedPlantIds);

function toListItem({ id, identity, traits, image, likesCount }: Plant) {
  return buildPlantListItem({ id, identity, traits, image, likesCount });
}

function LocationProbe() {
  return <span data-testid="pathname">{useLocation().pathname}</span>;
}

beforeEach(() => {
  vi.clearAllMocks();
  clearStoredToken();
  mockedGetBookmarkedPlantIds.mockResolvedValue(new Set());
});

describe('PlantCard', () => {
  const defaultPlant = toListItem(listPlantsResponse.data[0]);
  const otherPlant = toListItem(listPlantsResponse.data[1]);

  const renderComponent = (plant = defaultPlant) =>
    renderWithProviders(<PlantCard plant={plant} />);

  it('renders plant name capitalized', () => {
    renderComponent();

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Perejil'
    );
  });

  it.each([defaultPlant, otherPlant])(
    'renders the primary image of $identity.name.primary',
    (plant) => {
      renderComponent(plant);

      const image = screen.getByRole('img', {
        name: plant.identity.name.primary
      });

      expect(image).toHaveAttribute('src', plant.image.url);
    }
  );

  it('renders scientific name badge', () => {
    renderComponent();

    expect(
      screen.getByText(
        capitalizeFirstLetter(defaultPlant.identity.scientificName!)
      )
    ).toBeInTheDocument();
  });

  it('renders the scientific name with the scientific name style', () => {
    renderComponent();

    expect(
      screen.getByText(
        capitalizeFirstLetter(defaultPlant.identity.scientificName!)
      )
    ).toHaveClass('scientific-name');
  });

  it('renders all aliases', () => {
    renderComponent();

    defaultPlant.identity.name.aliases.forEach((alias) => {
      expect(
        screen.getByText(capitalizeFirstLetter(alias))
      ).toBeInTheDocument();
    });
  });

  it('links to plant detail page', () => {
    renderComponent();

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/plants/${defaultPlant.id}`
    );
  });

  it('does not render scientific name when absent', () => {
    const plantWithoutScientific = {
      ...defaultPlant,
      identity: {
        ...defaultPlant.identity,
        scientificName: undefined
      }
    };

    renderWithProviders(<PlantCard plant={plantWithoutScientific} />);

    expect(
      screen.queryByText(
        capitalizeFirstLetter(defaultPlant.identity.scientificName!)
      )
    ).not.toBeInTheDocument();
  });

  it('does not render aliases container when aliases are empty', () => {
    const plantWithoutAliases = {
      ...defaultPlant,
      identity: {
        ...defaultPlant.identity,
        name: {
          ...defaultPlant.identity.name,
          aliases: []
        }
      }
    };

    renderWithProviders(<PlantCard plant={plantWithoutAliases} />);

    expect(document.querySelector('.plant-aliases')).not.toBeInTheDocument();
  });

  function safetyIndicators() {
    return screen
      .queryAllByRole('img')
      .map((img) => img.getAttribute('aria-label'))
      .filter((name) => name === 'Comestible' || name === 'Tóxica');
  }

  it.each<[PlantEcologicalTraits, string[]]>([
    [{ edible: true }, ['Comestible']],
    [{ toxic: true }, ['Tóxica']],
    [{ edible: true, toxic: true }, ['Comestible', 'Tóxica']],
    [{ edible: false, toxic: false }, []],
    [{}, []]
  ])('shows safety indicators for %j', (ecological, expected) => {
    renderComponent(buildPlantListItemWithEcological(ecological));

    expect(safetyIndicators()).toEqual(expected);
  });

  it('shows no safety indicators without ecological data', () => {
    renderComponent({
      ...defaultPlant,
      traits: { ...defaultPlant.traits, ecological: undefined }
    });

    expect(safetyIndicators()).toEqual([]);
  });

  it('marks a deleted plant in the card heading', () => {
    renderComponent(buildPlantListItem({ status: 'DELETED' }));

    const heading = document.querySelector('.plant-card__heading');

    expect(heading).toHaveTextContent('Borrada');
  });

  it.each(['ACTIVE', undefined] as const)(
    'does not mark a plant with status %s',
    (status) => {
      renderComponent(buildPlantListItem({ status }));

      expect(screen.queryByText('Borrada')).not.toBeInTheDocument();
    }
  );

  describe('botón de favorito', () => {
    it('sin sesión no se renderiza', () => {
      renderComponent();

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('con sesión se renderiza relleno si la planta es favorita', async () => {
      mockedGetBookmarkedPlantIds.mockResolvedValue(new Set([defaultPlant.id]));

      renderWithProviders(<PlantCard plant={defaultPlant} />, {
        initialToken: VALID_TEST_TOKEN
      });

      const button = await screen.findByRole('button');
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-pressed', 'true');
      });
    });

    it('no anida el botón de favorito dentro del enlace de navegación', async () => {
      renderWithProviders(<PlantCard plant={defaultPlant} />, {
        initialToken: VALID_TEST_TOKEN
      });

      const button = await screen.findByRole('button');
      expect(screen.getByRole('link')).not.toContainElement(button);
    });

    it('pulsar el corazón alterna el estado sin navegar al detalle', async () => {
      mockedGetBookmarkedPlantIds.mockResolvedValue(new Set());
      const user = userEvent.setup();

      renderWithProviders(
        <>
          <LocationProbe />
          <PlantCard plant={defaultPlant} />
        </>,
        { initialToken: VALID_TEST_TOKEN, route: '/plants' }
      );
      const button = await screen.findByRole('button');

      await user.click(button);

      expect(screen.getByTestId('pathname')).toHaveTextContent('/plants');
    });
  });

  describe('contador de me gusta', () => {
    it('no genera ningún elemento de likes en el DOM cuando likesCount es 0', () => {
      renderComponent(buildPlantListItem({ likesCount: 0 }));

      expect(
        document.querySelector('.plant-card__likes')
      ).not.toBeInTheDocument();
      expect(
        document.querySelector('.plant-card__footer')
      ).not.toBeInTheDocument();
    });

    it('renderiza el icono favorite y el contador formateado cuando likesCount es mayor que 0', () => {
      renderComponent(buildPlantListItem({ likesCount: 1200 }));

      const likesContainer = document.querySelector('.plant-card__likes');
      expect(likesContainer).toBeInTheDocument();
      expect(screen.getByText('1.200')).toBeInTheDocument();
      expect(likesContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('asigna la etiqueta accesible singular cuando likesCount es 1', () => {
      renderComponent(buildPlantListItem({ likesCount: 1 }));

      const likesContainer = screen.getByLabelText(
        '1 persona ha indicado que le gusta esta planta'
      );
      expect(likesContainer).toBeInTheDocument();
    });

    it.each([
      [5, '5 personas han indicado que les gusta esta planta'],
      [15420, '15.420 personas han indicado que les gusta esta planta']
    ])(
      'asigna la etiqueta accesible plural para %i me gusta',
      (count, expectedLabel) => {
        renderComponent(buildPlantListItem({ likesCount: count }));

        const likesContainer = screen.getByLabelText(expectedLabel);
        expect(likesContainer).toBeInTheDocument();
      }
    );

    it('shows the counter next to the deleted badge on DELETED plants', () => {
      renderComponent(
        buildPlantListItem({ status: 'DELETED', likesCount: 42 })
      );

      expect(screen.getByText('Borrada')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('coexistencia con la colección privada de favoritos', () => {
    it('usuario sin sesión ve el contador público sin botón de favorito', () => {
      renderComponent(buildPlantListItem({ likesCount: 10 }));

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('usuario con sesión ve ambos elementos simultáneamente', async () => {
      renderWithProviders(
        <PlantCard plant={buildPlantListItem({ likesCount: 7 })} />,
        { initialToken: VALID_TEST_TOKEN }
      );

      const button = await screen.findByRole('button');
      expect(button).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('pulsar el botón de favorito no altera el contador estático de me gusta', async () => {
      mockedGetBookmarkedPlantIds.mockResolvedValue(new Set());
      const user = userEvent.setup();

      renderWithProviders(
        <PlantCard plant={buildPlantListItem({ likesCount: 7 })} />,
        { initialToken: VALID_TEST_TOKEN }
      );
      const button = await screen.findByRole('button');

      await user.click(button);

      expect(screen.getByText('7')).toBeInTheDocument();
    });
  });
});
