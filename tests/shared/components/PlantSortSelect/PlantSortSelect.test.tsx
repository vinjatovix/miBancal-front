import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import PlantSortSelect from '../../../../src/shared/components/PlantSortSelect/PlantSortSelect';
import { buildSortOptions } from '../../../../src/pages/plants/utils/buildSortOptions';

const OPTIONS = buildSortOptions();

function renderSelect(value = 'name:asc', onChange = vi.fn()) {
  render(
    <PlantSortSelect
      label="Ordenar"
      value={value}
      options={OPTIONS}
      onChange={onChange}
    />
  );
  return { onChange };
}

describe('PlantSortSelect', () => {
  it('renderiza las 4 opciones con su etiqueta legible', () => {
    renderSelect();

    const select = screen.getByRole('combobox', { name: 'Ordenar' });
    expect(select).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('el valor activo deriva del valor recibido', () => {
    renderSelect('scientificName:desc');

    expect(
      screen.getByRole('combobox', { name: 'Ordenar' })
    ).toHaveDisplayValue('Nombre científico (Z-A)');
  });

  it('emite el valor compuesto al cambiar, operable por teclado', async () => {
    const { onChange } = renderSelect('name:asc');

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Ordenar' }),
      'Nombre común (Z-A)'
    );

    expect(onChange).toHaveBeenCalledWith('name:desc');
  });
});
