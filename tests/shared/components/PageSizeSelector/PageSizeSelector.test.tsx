import '@testing-library/jest-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import PageSizeSelector from '../../../../src/shared/components/PageSizeSelector/PageSizeSelector';
import { SUPPORTED_LIMITS } from '../../../../src/shared/components/constants';

function renderSelector(value = 25, onChange = vi.fn()) {
  render(
    <PageSizeSelector label="Mostrar" value={value} onChange={onChange} />
  );
  return { onChange };
}

describe('PageSizeSelector', () => {
  it('renderiza un segmento por valor soportado con etiqueta accesible', () => {
    renderSelector();

    const group = screen.getByRole('group', { name: 'Mostrar' });
    expect(
      within(group)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(SUPPORTED_LIMITS.map(String));
  });

  it('resalta el valor activo con aria-pressed', () => {
    renderSelector(50);

    const group = screen.getByRole('group', { name: 'Mostrar' });
    expect(within(group).getByRole('button', { name: '50' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(within(group).getByRole('button', { name: '25' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('emite el valor elegido al pulsar un segmento', async () => {
    const { onChange } = renderSelector(25);

    await userEvent.click(screen.getByRole('button', { name: '100' }));

    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('es operable por teclado', async () => {
    const onChange = vi.fn();
    renderSelector(25, onChange);

    const group = screen.getByRole('group', { name: 'Mostrar' });
    within(group).getByRole('button', { name: '50' }).focus();
    await userEvent.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(50);
  });
});
