import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { EditButton } from '../../../../src/shared/components/ActionButtons';

describe('EditButton', () => {
  it('renders default label and icon', () => {
    render(<EditButton />);

    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(<EditButton label="Editar planta" />);

    expect(
      screen.getByRole('button', { name: 'Editar planta' })
    ).toBeInTheDocument();
  });

  it('uses ariaLabel as accessible name when provided', () => {
    render(<EditButton ariaLabel="Editar registro #12" />);

    expect(
      screen.getByRole('button', { name: 'Editar registro #12' })
    ).toBeInTheDocument();
  });

  it('hides visible label in iconOnly mode while keeping accessible name', () => {
    render(<EditButton iconOnly ariaLabel="Editar elemento" />);

    const button = screen.getByRole('button', { name: 'Editar elemento' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('action-btn--icon-only');
  });

  it('applies compact size class when size is sm', () => {
    render(<EditButton size="sm" />);

    expect(screen.getByRole('button')).toHaveClass('action-btn--sm');
  });

  it('disables button when disabled prop is true', () => {
    render(<EditButton disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('triggers onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<EditButton onClick={handleClick} />);

    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
