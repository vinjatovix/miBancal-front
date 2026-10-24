import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ViewModeToggle from '../../../../../src/pages/plants/components/ViewModeToggle/ViewModeToggle';

describe('ViewModeToggle', () => {
  it('refleja el valor recibido con aria-pressed', () => {
    render(<ViewModeToggle value="grid" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Cuadrícula' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Lista' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('emite el modo elegido al pulsar un segmento', async () => {
    const onChange = vi.fn();
    render(<ViewModeToggle value="grid" onChange={onChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Lista' }));

    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('notifica el modo elegido, operable por teclado', async () => {
    const onChange = vi.fn();
    render(<ViewModeToggle value="grid" onChange={onChange} />);

    screen.getByRole('button', { name: 'Lista' }).focus();
    await userEvent.keyboard('{Enter}');

    expect(onChange).toHaveBeenLastCalledWith('list');
  });

  it('expone el conmutador con una etiqueta accesible', () => {
    render(<ViewModeToggle value="grid" onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Vista' })).toBeInTheDocument();
  });
});
