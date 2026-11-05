import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlantRelationSearchCombobox from '../../../../src/pages/plantRelations/components/PlantRelationSearchCombobox';
import { usePlantSearch } from '../../../../src/pages/plantRelations/hooks/usePlantSearch';
import { listPlantsResponse } from '../../../fixtures/plants/listPlants';

vi.mock('../../../../src/pages/plantRelations/hooks/usePlantSearch', () => ({
  usePlantSearch: vi.fn()
}));

const mockedUsePlantSearch = vi.mocked(usePlantSearch);
const mockPlants = listPlantsResponse.data;

describe('PlantRelationSearchCombobox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUsePlantSearch.mockReturnValue({
      data: undefined,
      isLoading: false
    } as unknown as ReturnType<typeof usePlantSearch>);
  });

  it('renders combobox with accessible role and placeholder', () => {
    render(
      <PlantRelationSearchCombobox
        selectedPlant={null}
        onSelectPlant={vi.fn()}
      />
    );

    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveAttribute(
      'placeholder',
      'Buscar planta por nombre común o científico...'
    );
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
  });

  it('displays search results in listbox when query returns matches', async () => {
    mockedUsePlantSearch.mockReturnValue({
      data: {
        data: mockPlants,
        pagination: {
          page: 1,
          limit: 5,
          totalPages: 1,
          totalItems: mockPlants.length
        }
      },
      isLoading: false
    } as unknown as ReturnType<typeof usePlantSearch>);

    const user = userEvent.setup();
    render(
      <PlantRelationSearchCombobox
        selectedPlant={null}
        onSelectPlant={vi.fn()}
      />
    );

    const combobox = screen.getByRole('combobox');
    await user.type(combobox, 'tom');

    const listbox = await screen.findByRole('listbox');
    expect(listbox).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(mockPlants.length);
  });

  it('invokes onSelectPlant and closes dropdown when an option is clicked', async () => {
    mockedUsePlantSearch.mockReturnValue({
      data: {
        data: mockPlants,
        pagination: {
          page: 1,
          limit: 5,
          totalPages: 1,
          totalItems: mockPlants.length
        }
      },
      isLoading: false
    } as unknown as ReturnType<typeof usePlantSearch>);

    const onSelectPlant = vi.fn();
    const user = userEvent.setup();
    render(
      <PlantRelationSearchCombobox
        selectedPlant={null}
        onSelectPlant={onSelectPlant}
      />
    );

    const combobox = screen.getByRole('combobox');
    await user.type(combobox, 'tom');

    const firstOption = await screen.findByRole('option', {
      name: new RegExp(mockPlants[0].identity.name.primary, 'i')
    });
    await user.click(firstOption);

    expect(onSelectPlant).toHaveBeenCalledExactlyOnceWith(mockPlants[0]);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('clears selection when clear button is clicked', async () => {
    const onSelectPlant = vi.fn();
    const user = userEvent.setup();
    render(
      <PlantRelationSearchCombobox
        selectedPlant={mockPlants[0]}
        onSelectPlant={onSelectPlant}
      />
    );

    const clearButton = screen.getByRole('button', {
      name: 'Limpiar selección'
    });
    await user.click(clearButton);

    expect(onSelectPlant).toHaveBeenCalledExactlyOnceWith(null);
  });

  it('selects option via keyboard arrow down and enter', async () => {
    mockedUsePlantSearch.mockReturnValue({
      data: {
        data: mockPlants,
        pagination: {
          page: 1,
          limit: 5,
          totalPages: 1,
          totalItems: mockPlants.length
        }
      },
      isLoading: false
    } as unknown as ReturnType<typeof usePlantSearch>);

    const onSelectPlant = vi.fn();
    const user = userEvent.setup();
    render(
      <PlantRelationSearchCombobox
        selectedPlant={null}
        onSelectPlant={onSelectPlant}
      />
    );

    const combobox = screen.getByRole('combobox');
    await user.type(combobox, 'tom');
    await screen.findByRole('listbox');

    await user.keyboard('{ArrowDown}{Enter}');

    expect(onSelectPlant).toHaveBeenCalledExactlyOnceWith(mockPlants[0]);
  });

  it('updates aria-activedescendant attribute when arrowing down options', async () => {
    mockedUsePlantSearch.mockReturnValue({
      data: {
        data: mockPlants,
        pagination: {
          page: 1,
          limit: 5,
          totalPages: 1,
          totalItems: mockPlants.length
        }
      },
      isLoading: false
    } as unknown as ReturnType<typeof usePlantSearch>);
    const user = userEvent.setup();

    render(
      <PlantRelationSearchCombobox
        selectedPlant={null}
        onSelectPlant={vi.fn()}
      />
    );

    const combobox = screen.getByRole('combobox');
    await user.type(combobox, 'tom');
    await screen.findByRole('listbox');
    await user.keyboard('{ArrowDown}');

    expect(combobox).toHaveAttribute(
      'aria-activedescendant',
      `plant-combobox-opt-${mockPlants[0].id}`
    );
  });

  it('filters out plant matching excludePlantId from search results', async () => {
    mockedUsePlantSearch.mockReturnValue({
      data: {
        data: mockPlants,
        pagination: {
          page: 1,
          limit: 5,
          totalPages: 1,
          totalItems: mockPlants.length
        }
      },
      isLoading: false
    } as unknown as ReturnType<typeof usePlantSearch>);
    const user = userEvent.setup();
    const excludedPlantId = mockPlants[0].id;

    render(
      <PlantRelationSearchCombobox
        selectedPlant={null}
        onSelectPlant={vi.fn()}
        excludePlantId={excludedPlantId}
      />
    );

    const combobox = screen.getByRole('combobox');
    await user.type(combobox, 'tom');
    await screen.findByRole('listbox');

    expect(
      screen.queryByRole('option', {
        name: new RegExp(mockPlants[0].identity.name.primary, 'i')
      })
    ).not.toBeInTheDocument();
  });
});
