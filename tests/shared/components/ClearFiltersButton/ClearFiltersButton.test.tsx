import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ClearFiltersButton } from '../../../../src/shared/components/ClearFiltersButton';

describe('ClearFiltersButton', () => {
  it('renders default label and clear_all icon', () => {
    render(<ClearFiltersButton onClear={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Limpiar filtros' })
    ).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(<ClearFiltersButton onClear={vi.fn()} label="Limpiar todo" />);

    expect(
      screen.getByRole('button', { name: 'Limpiar todo' })
    ).toBeInTheDocument();
  });

  it('sets data-testid when testId is passed', () => {
    render(<ClearFiltersButton onClear={vi.fn()} testId="clear-filters" />);

    expect(screen.getByTestId('clear-filters')).toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<ClearFiltersButton onClear={vi.fn()} disabled />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onClear callback when clicked and not disabled', async () => {
    const user = userEvent.setup();
    const handleClear = vi.fn();
    render(<ClearFiltersButton onClear={handleClear} />);

    await user.click(screen.getByRole('button'));

    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
