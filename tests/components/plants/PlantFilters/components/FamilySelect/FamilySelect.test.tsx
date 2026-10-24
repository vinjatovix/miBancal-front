import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import FamilySelect from '../../../../../../src/components/plants/PlantFilters/components/FamilySelect/FamilySelect';
import { getFamilyList } from '../../../../../../src/services/families.service';
import { ApiError } from '../../../../../../src/shared/errors/ApiError';
import { NetworkError } from '../../../../../../src/shared/errors/NetworkError';
import type { FamilyListItem } from '../../../../../../src/types/Family';
import { buildFamilyListItem } from '../../../../../fixtures/families/buildFamilyListItem';
import { listFamilyItems } from '../../../../../fixtures/families/listFamilyItems';
import { createTestQueryClient } from '../../../../../test-utils/createTestQueryClient';

vi.mock('../../../../../../src/services/families.service', () => ({
  getFamilyList: vi.fn()
}));

const mockedGetFamilyList = vi.mocked(getFamilyList);

function resolveFamilies(data: FamilyListItem[]) {
  mockedGetFamilyList.mockResolvedValue(data);
}

function renderFamilySelect(onChange = vi.fn()) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <FamilySelect value="" onChange={onChange} />
    </QueryClientProvider>
  );
}

async function findOptionTexts(): Promise<Array<string | null>> {
  await screen.findByRole('option', { name: 'Todas las familias' });
  return screen.getAllByRole('option').map((option) => option.textContent);
}

describe('FamilySelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetFamilyList.mockResolvedValue(listFamilyItems);
  });

  it('renders initial reset option with empty value and all families label', async () => {
    renderFamilySelect();

    const resetOption = await screen.findByRole('option', {
      name: 'Todas las familias'
    });
    expect(screen.getAllByRole('option')[0]).toBe(resetOption);
    expect(resetOption).toHaveValue('');
  });

  it.each([
    { name: 'amarilidáceas', expected: 'Amarilidáceas' },
    { name: 'apiáceas', expected: 'Apiáceas' },
    { name: 'solanáceas', expected: 'Solanáceas' }
  ])(
    'displays capitalized Spanish name for $name',
    async ({ name, expected }) => {
      resolveFamilies([buildFamilyListItem({ id: 'test-id', name })]);

      renderFamilySelect();

      expect(
        await screen.findByRole('option', { name: expected })
      ).toBeInTheDocument();
    }
  );

  it('sorts family options alphabetically using Spanish locale collation', async () => {
    resolveFamilies([
      buildFamilyListItem({ id: 'f-3', name: 'solanáceas' }),
      buildFamilyListItem({ id: 'f-1', name: 'amarilidáceas' }),
      buildFamilyListItem({ id: 'f-4', name: 'ásteres' }),
      buildFamilyListItem({ id: 'f-2', name: 'brassicáceas' })
    ]);

    renderFamilySelect();

    expect(await findOptionTexts()).toEqual([
      'Todas las familias',
      'Amarilidáceas',
      'Ásteres',
      'Brassicáceas',
      'Solanáceas'
    ]);
  });

  it('maintains family UUID id as option value', async () => {
    const [family] = listFamilyItems;

    renderFamilySelect();

    expect(
      await screen.findByRole('option', { name: 'Amarilidáceas' })
    ).toHaveValue(family.id);
  });

  it('calls onChange callback with family id when user selects an option', async () => {
    const handleChange = vi.fn();
    const [, family] = listFamilyItems;
    renderFamilySelect(handleChange);
    await screen.findByRole('option', { name: 'Apiáceas' });

    fireEvent.change(screen.getByTestId('family-select'), {
      target: { value: family.id }
    });

    expect(handleChange).toHaveBeenCalledWith(family.id);
  });

  it('muestra el recuento de familias registradas', async () => {
    renderFamilySelect();

    expect(
      await screen.findByText(`${listFamilyItems.length} registradas`)
    ).toBeInTheDocument();
  });

  it('keeps the select enabled with only the reset option when there are no families', async () => {
    resolveFamilies([]);

    renderFamilySelect();

    expect(await findOptionTexts()).toEqual(['Todas las familias']);
    expect(screen.getByTestId('family-select')).toBeEnabled();
  });

  describe('while families are loading', () => {
    beforeEach(() => {
      mockedGetFamilyList.mockImplementation(
        () => new Promise<FamilyListItem[]>(() => {})
      );
    });

    it('disables the select input', () => {
      renderFamilySelect();

      expect(screen.getByTestId('family-select')).toBeDisabled();
    });

    it('renders loading option', () => {
      renderFamilySelect();

      expect(screen.getByRole('option', { name: 'Cargando...' })).toHaveValue(
        ''
      );
    });
  });

  describe('when families query fails', () => {
    beforeEach(() => {
      mockedGetFamilyList.mockRejectedValue(
        new NetworkError(new TypeError('Failed to fetch'))
      );
    });

    it('explains that families could not be loaded and offers retry', async () => {
      renderFamilySelect();

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'No se han podido cargar las familias.'
      );
      expect(
        screen.getByRole('button', { name: 'Reintentar' })
      ).toBeInTheDocument();
      expect(screen.queryByText('Error desconocido')).not.toBeInTheDocument();
    });

    it('disables the select and marks it invalid', async () => {
      renderFamilySelect();
      await screen.findByRole('alert');

      const select = screen.getByTestId('family-select');
      expect(select).toBeDisabled();
      expect(select).toHaveAttribute('aria-invalid', 'true');
      expect(select).toHaveAccessibleDescription(
        'No se han podido cargar las familias.'
      );
    });

    it('loads the families when retrying with a good response', async () => {
      renderFamilySelect();
      mockedGetFamilyList.mockResolvedValue(listFamilyItems);

      await userEvent.click(
        await screen.findByRole('button', { name: 'Reintentar' })
      );

      expect(
        await screen.findByRole('option', { name: 'Amarilidáceas' })
      ).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByTestId('family-select')).toBeEnabled();
    });

    it('does not offer retry when forbidden', async () => {
      mockedGetFamilyList.mockRejectedValue(new ApiError('Forbidden', 403));

      renderFamilySelect();

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'No se han podido cargar las familias.'
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
