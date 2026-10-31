import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import AppliedFiltersBar from '../../../../../src/pages/plants/components/AppliedFiltersBar/AppliedFiltersBar';
import type { ActiveFilter } from '../../../../../src/pages/plants/utils/buildActiveFilters';

const FILTERS: ActiveFilter[] = [
  { id: 'lifeCycle', label: 'Perenne', param: 'lifeCycle' },
  { id: 'lightType', label: 'Sol pleno', param: 'lightType' }
];

function renderBar(
  filters = FILTERS,
  onRemove = vi.fn(),
  onClearAll = vi.fn()
) {
  render(
    <AppliedFiltersBar
      filters={filters}
      onRemove={onRemove}
      onClearAll={onClearAll}
    />
  );
  return { onRemove, onClearAll };
}

describe('AppliedFiltersBar', () => {
  it('no se renderiza sin filtros activos', () => {
    const { container } = render(
      <AppliedFiltersBar filters={[]} onRemove={vi.fn()} onClearAll={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza un chip por filtro con su etiqueta', () => {
    renderBar();

    expect(screen.getByText('Perenne')).toBeInTheDocument();
    expect(screen.getByText('Sol pleno')).toBeInTheDocument();
  });

  it('cada chip tiene un botón de quitar accesible por etiqueta', async () => {
    const { onRemove } = renderBar();

    await userEvent.click(
      screen.getByRole('button', { name: 'Quitar filtro Perenne' })
    );

    expect(onRemove).toHaveBeenCalledWith(FILTERS[0]);
  });

  it('ofrece la acción "Limpiar todo"', async () => {
    const { onClearAll } = renderBar();

    await userEvent.click(screen.getByRole('button', { name: 'Limpiar todo' }));

    expect(onClearAll).toHaveBeenCalled();
  });

  it('es operable por teclado', async () => {
    const onRemove = vi.fn();
    renderBar(FILTERS, onRemove);

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(onRemove).toHaveBeenCalledWith(FILTERS[0]);
  });
});
