import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnomalyFilters from '../../../src/components/anomalies/AnomalyFilters/AnomalyFilters';
import { renderWithProviders } from '../../test-utils/renderWithProviders';

function renderFilters(
  props: Partial<React.ComponentProps<typeof AnomalyFilters>> = {}
) {
  const handlers = {
    onCategoryChange: vi.fn(),
    onClear: vi.fn()
  };
  renderWithProviders(<AnomalyFilters category="" {...handlers} {...props} />);
  return handlers;
}

describe('AnomalyFilters', () => {
  it('ofrece las cuatro categorías traducidas y emite la elegida', async () => {
    const handlers = renderFilters();
    const user = userEvent.setup();

    const select = screen.getByLabelText('Categoría');
    await user.selectOptions(select, 'weed');

    expect(
      screen.getAllByRole('option', {
        name: /Plaga|Enfermedad|Desorden|Maleza/
      })
    ).toHaveLength(4);
    expect(handlers.onCategoryChange).toHaveBeenCalledWith('weed');
  });

  it('refleja el valor recibido por props', () => {
    renderFilters({ category: 'pest' });

    expect(screen.getByLabelText('Categoría')).toHaveValue('pest');
  });

  it('emite onClear al limpiar los filtros', async () => {
    const handlers = renderFilters();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Limpiar filtros/ }));

    expect(handlers.onClear).toHaveBeenCalledOnce();
  });
});
