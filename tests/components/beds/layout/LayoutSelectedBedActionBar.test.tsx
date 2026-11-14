import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutSelectedBedActionBar, {
  type LayoutSelectedBedActionBarProps
} from '../../../../src/components/beds/layout/LayoutSelectedBedActionBar';

function buildProps(
  overrides: Partial<LayoutSelectedBedActionBarProps> = {}
): LayoutSelectedBedActionBarProps {
  return {
    bedName: 'Bancal Nabizas',
    onRotate: vi.fn(),
    onUnplace: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onDeselect: vi.fn(),
    disabled: false,
    ...overrides
  };
}

describe('LayoutSelectedBedActionBar', () => {
  it('renders the selected bed name with title attribute', () => {
    render(<LayoutSelectedBedActionBar {...buildProps()} />);

    const nameElement = screen.getByText('Bancal Nabizas');
    expect(nameElement).toBeInTheDocument();
    expect(nameElement).toHaveAttribute('title', 'Bancal Nabizas');
  });

  it('renders toolbar with accessible role and label', () => {
    render(<LayoutSelectedBedActionBar {...buildProps()} />);

    expect(
      screen.getByRole('toolbar', { name: 'Acciones de selección' })
    ).toBeInTheDocument();
  });

  it('invokes onRotate when clicking rotate button', async () => {
    const user = userEvent.setup();
    const props = buildProps();
    render(<LayoutSelectedBedActionBar {...props} />);

    await user.click(screen.getByRole('button', { name: 'Rotar bancal' }));

    expect(props.onRotate).toHaveBeenCalledTimes(1);
  });

  it('invokes onUnplace when clicking unplace button', async () => {
    const user = userEvent.setup();
    const props = buildProps();
    render(<LayoutSelectedBedActionBar {...props} />);

    await user.click(
      screen.getByRole('button', { name: 'Devolver a sin colocar' })
    );

    expect(props.onUnplace).toHaveBeenCalledTimes(1);
  });

  it('invokes onEdit when clicking edit button', async () => {
    const user = userEvent.setup();
    const props = buildProps();
    render(<LayoutSelectedBedActionBar {...props} />);

    await user.click(screen.getByRole('button', { name: 'Editar bancal' }));

    expect(props.onEdit).toHaveBeenCalledTimes(1);
  });

  it('invokes onDelete when clicking delete button', async () => {
    const user = userEvent.setup();
    const props = buildProps();
    render(<LayoutSelectedBedActionBar {...props} />);

    await user.click(screen.getByRole('button', { name: 'Eliminar bancal' }));

    expect(props.onDelete).toHaveBeenCalledTimes(1);
  });

  it('invokes onDeselect when clicking close button', async () => {
    const user = userEvent.setup();
    const props = buildProps();
    render(<LayoutSelectedBedActionBar {...props} />);

    await user.click(
      screen.getByRole('button', { name: 'Deseleccionar bancal' })
    );

    expect(props.onDeselect).toHaveBeenCalledTimes(1);
  });

  it('disables all action buttons when disabled is true', () => {
    render(<LayoutSelectedBedActionBar {...buildProps({ disabled: true })} />);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });
});
