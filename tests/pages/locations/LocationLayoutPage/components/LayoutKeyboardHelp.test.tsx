import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import LayoutKeyboardHelp from '../../../../../src/pages/locations/LocationLayoutPage/components/LayoutKeyboardHelp';

describe('LayoutKeyboardHelp', () => {
  it('renders trigger button for keyboard shortcuts help', () => {
    render(<LayoutKeyboardHelp />);

    expect(
      screen.getByRole('button', { name: 'Atajos de teclado' })
    ).toBeInTheDocument();
  });

  it('opens dialog with shortcut list when clicked', async () => {
    const user = userEvent.setup();

    render(<LayoutKeyboardHelp />);

    await user.click(screen.getByRole('button', { name: 'Atajos de teclado' }));

    expect(
      screen.getByRole('dialog', { name: 'Atajos de teclado del diseñador' })
    ).toBeInTheDocument();
    expect(screen.getByText('Modo Ver: 1')).toBeInTheDocument();
    expect(screen.getByText('Modo Colocar: 2')).toBeInTheDocument();
    expect(screen.getByText('Modo Sembrar: 3')).toBeInTheDocument();
    expect(
      screen.getByText('Rotar bancal seleccionado: R')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Devolver bancal a sin colocar: U')
    ).toBeInTheDocument();
  });

  it('closes dialog when clicking close button', async () => {
    const user = userEvent.setup();

    render(<LayoutKeyboardHelp />);

    await user.click(screen.getByRole('button', { name: 'Atajos de teclado' }));
    expect(
      screen.getByRole('dialog', { name: 'Atajos de teclado del diseñador' })
    ).toBeInTheDocument();

    await user.click(
      screen.getAllByRole('button', { name: 'Cerrar panel de atajos' })[0]
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
