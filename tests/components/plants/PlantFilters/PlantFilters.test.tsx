import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';

import PlantFilters from '../../../../src/components/plants/PlantFilters/PlantFilters';
import { getFamilyList } from '../../../../src/services/families.service';
import { listFamilyItems } from '../../../fixtures/families/listFamilyItems';
import { createTestQueryClient } from '../../../test-utils/createTestQueryClient';

const mockSetParam = vi.fn();
const mockSetParamNow = vi.fn();
const mockGetParam = vi.fn();
const mockClearFilters = vi.fn();
const mockSetHemisphere = vi.fn();
const mockHandleTextChange = vi.fn();
const mockSetFamily = vi.fn();
const mockBooleans: { edible?: string; toxic?: string } = {};

vi.mock('../../../../src/services/families.service', () => ({
  getFamilyList: vi.fn()
}));

const mockedGetFamilyList = vi.mocked(getFamilyList);

vi.mock(
  '../../../../src/components/plants/PlantFilters/hooks/usePlantFilters',
  () => ({
    usePlantFilters: () => ({
      setParam: mockSetParam,
      setParamNow: mockSetParamNow,
      getParam: mockGetParam,

      lifeCycle: 'annual',
      sowingMethod: 'direct',
      lightType: 'full_sun',
      rootSystem: 'taproot',
      edible: mockBooleans.edible,
      toxic: mockBooleans.toxic,

      hemisphere: 'north',
      sowingMonth: 3,

      family: 'family-id',
      setFamily: mockSetFamily,

      textState: {
        identity: 'identity'
      },

      handleTextChange: mockHandleTextChange,

      soilPh: { value: 6, setValue: vi.fn() },
      lightHours: { value: 8, setValue: vi.fn() },
      spacing: { value: 30, setValue: vi.fn() },
      soilDepth: { value: 40, setValue: vi.fn() },

      clearFilters: mockClearFilters,
      setHemisphere: mockSetHemisphere
    })
  })
);

describe('PlantFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetParam.mockReturnValue('');
    mockedGetFamilyList.mockResolvedValue(listFamilyItems);
    mockBooleans.edible = undefined;
    mockBooleans.toxic = undefined;
  });

  function renderComponent(activeCount?: number) {
    return render(
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter>
          <PlantFilters activeCount={activeCount} />
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  it('renders identity input', () => {
    renderComponent();
    expect(screen.getByTestId('text-filter-identity')).toBeInTheDocument();
  });

  it('muestra la búsqueda rápida destacada al principio del panel', () => {
    renderComponent();

    const quick = screen.getByTestId('quick-search');
    const identityInput = screen.getByTestId('text-filter-identity');
    const familySelect = screen.getByTestId('family-select');

    expect(quick).toContainElement(identityInput);
    expect(
      identityInput.compareDocumentPosition(familySelect) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('limits the search input to the contract FilterText length', () => {
    renderComponent();
    expect(screen.getByTestId('text-filter-identity')).toHaveAttribute(
      'maxlength',
      '200'
    );
  });

  it('calls handleTextChange when identity input changes', () => {
    renderComponent();

    fireEvent.change(screen.getByTestId('text-filter-identity'), {
      target: { value: 'pepper' }
    });

    expect(mockHandleTextChange).toHaveBeenCalledWith('identity', 'pepper');
  });

  it('calls clearFilters', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('clear-filters'));

    expect(mockClearFilters).toHaveBeenCalled();
  });

  it('la acción de limpiar se llama "Limpiar todo"', () => {
    renderComponent();

    expect(
      screen.getByRole('button', { name: /Limpiar todo/ })
    ).toBeInTheDocument();
  });

  it('muestra el indicador de filtros activos cuando hay al menos uno', () => {
    renderComponent(3);

    expect(screen.getByText('3 activos')).toBeInTheDocument();
  });

  it('no muestra el indicador de filtros activos sin filtros', () => {
    renderComponent(0);

    expect(screen.queryByText(/activos/)).not.toBeInTheDocument();
  });

  it('calls setFamily from FamilySelect', async () => {
    const [, family] = listFamilyItems;
    renderComponent();
    await screen.findByRole('option', { name: 'Apiáceas' });

    fireEvent.change(screen.getByTestId('family-select'), {
      target: { value: family.id }
    });

    expect(mockSetFamily).toHaveBeenCalledWith(family.id);
  });

  it('calls setHemisphere', () => {
    renderComponent();

    fireEvent.click(screen.getByText('Sur'));

    expect(mockSetHemisphere).toHaveBeenCalledWith('south');
  });

  it('calls setParamNow from MonthSelector', () => {
    renderComponent();

    fireEvent.click(screen.getByTestId('month-button-5'));

    expect(mockSetParamNow).toHaveBeenCalledWith('sowingMonth', '5');
  });

  it('calls slider onCommit handlers', () => {
    renderComponent();

    const slider = screen.getByTestId('slider-filter-soilPh');

    (slider as HTMLInputElement).value = '8';

    fireEvent.pointerUp(slider);

    expect(mockSetParam).toHaveBeenCalledWith('soilPh', '8');
  });

  it.each([
    ['Ciclo de vida', 'Anual'],
    ['Método de siembra', 'Directa'],
    ['Tipo de luz', 'Sol pleno'],
    ['Sistema radicular', 'Pivotante']
  ])('the %s group keeps its Spanish labels', (group, option) => {
    renderComponent();

    const toggle = screen.getByRole('group', { name: new RegExp(group) });

    expect(
      within(toggle).getByRole('button', { name: option })
    ).toBeInTheDocument();
  });

  it.each(['Comestible', 'Tóxica'])(
    'renders the %s group with any, yes and no options',
    (name) => {
      renderComponent();

      const group = screen.getByRole('group', { name: new RegExp(name) });

      expect(
        within(group)
          .getAllByRole('button')
          .map((button) => button.textContent)
      ).toEqual(['Cualquiera', 'Sí', 'No']);
      expect(
        within(group).getByRole('button', { name: 'Cualquiera' })
      ).toHaveAttribute('aria-pressed', 'true');
      expect(within(group).getByRole('button', { name: 'Sí' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
      expect(group).toHaveAccessibleDescription(
        'Elegir «No» excluye las plantas sin dato.'
      );
    }
  );

  it('shows the boolean hint once', () => {
    renderComponent();

    expect(
      screen.getAllByText('Elegir «No» excluye las plantas sin dato.')
    ).toHaveLength(1);
  });

  it('marks the URL value as pressed', () => {
    mockBooleans.edible = 'true';
    mockBooleans.toxic = 'false';

    renderComponent();

    const edible = screen.getByRole('group', { name: /Comestible/ });
    const toxic = screen.getByRole('group', { name: /Tóxica/ });

    expect(within(edible).getByRole('button', { name: 'Sí' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(toxic).getByRole('button', { name: 'No' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it.each([
    ['Sí', 'true'],
    ['No', 'false'],
    ['Cualquiera', undefined]
  ])('choosing %s sets edible to %s', (option, value) => {
    mockBooleans.edible = 'true';
    renderComponent();

    const group = screen.getByRole('group', { name: /Comestible/ });
    fireEvent.click(within(group).getByRole('button', { name: option }));

    expect(mockSetParamNow).toHaveBeenCalledWith('edible', value);
  });

  it('the boolean options work with the keyboard', async () => {
    const user = userEvent.setup();
    renderComponent();

    const group = screen.getByRole('group', { name: /Tóxica/ });
    const any = within(group).getByRole('button', { name: 'Cualquiera' });
    const yes = within(group).getByRole('button', { name: 'Sí' });
    const no = within(group).getByRole('button', { name: 'No' });

    any.focus();
    await user.tab();
    expect(yes).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(mockSetParamNow).toHaveBeenLastCalledWith('toxic', 'true');

    await user.tab();
    expect(no).toHaveFocus();
    await user.keyboard(' ');
    expect(mockSetParamNow).toHaveBeenLastCalledWith('toxic', 'false');
  });
});
