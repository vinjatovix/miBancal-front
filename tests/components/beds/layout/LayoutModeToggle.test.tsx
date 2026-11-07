import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutModeToggle from '../../../../src/components/beds/layout/LayoutModeToggle';

describe('LayoutModeToggle', () => {
  it('marks the position segment as pressed in position mode', () => {
    render(<LayoutModeToggle active onToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Posición' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Vista' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('marks the view segment as pressed in read mode', () => {
    render(<LayoutModeToggle active={false} onToggle={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Vista' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'Posición' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('invokes onToggle when selecting the inactive segment', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(<LayoutModeToggle active={false} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: 'Posición' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onToggle when selecting the active segment', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(<LayoutModeToggle active={false} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: 'Vista' }));

    expect(onToggle).not.toHaveBeenCalled();
  });
});
