import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DeleteButton } from '../../../../src/shared/components/ActionButtons';

describe('DeleteButton', () => {
  it('renders default label, icon and danger class', () => {
    render(<DeleteButton />);

    const button = screen.getByRole('button', { name: 'Eliminar' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('action-btn--danger');
  });

  it('renders custom label when provided', () => {
    render(<DeleteButton label="Eliminar planta" />);

    expect(
      screen.getByRole('button', { name: 'Eliminar planta' })
    ).toBeInTheDocument();
  });

  it('uses ariaLabel as accessible name when provided', () => {
    render(<DeleteButton ariaLabel="Eliminar registro #42" />);

    expect(
      screen.getByRole('button', { name: 'Eliminar registro #42' })
    ).toBeInTheDocument();
  });

  it('displays loading label and disables button when isDeleting is true', () => {
    render(<DeleteButton isDeleting />);

    const button = screen.getByRole('button', { name: 'Eliminando...' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('displays custom loading label when isDeleting is true', () => {
    render(<DeleteButton isDeleting loadingLabel="Borrando..." />);

    expect(
      screen.getByRole('button', { name: 'Borrando...' })
    ).toBeInTheDocument();
  });

  it('hides visible label in iconOnly mode while keeping accessible name', () => {
    render(<DeleteButton iconOnly ariaLabel="Eliminar elemento" />);

    const button = screen.getByRole('button', { name: 'Eliminar elemento' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('action-btn--icon-only');
  });

  it('applies compact size class when size is sm', () => {
    render(<DeleteButton size="sm" />);

    expect(screen.getByRole('button')).toHaveClass('action-btn--sm');
  });

  it('disables button when disabled prop is true', () => {
    render(<DeleteButton disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('triggers onClick handler when clicked and not disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<DeleteButton onClick={handleClick} />);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
