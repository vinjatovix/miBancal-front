import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import SnapToggle from '../../../../src/components/beds/layout/SnapToggle';

describe('SnapToggle', () => {
  it('exposes an accessible switch reflecting the enabled state', () => {
    render(<SnapToggle enabled onToggle={vi.fn()} />);

    const toggle = screen.getByRole('switch', {
      name: 'Ajuste magnético a bancales vecinos'
    });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('reflects the disabled snap state', () => {
    render(<SnapToggle enabled={false} onToggle={vi.fn()} />);

    expect(
      screen.getByRole('switch', {
        name: 'Ajuste magnético a bancales vecinos'
      })
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('invokes onToggle when pressed', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(<SnapToggle enabled={false} onToggle={onToggle} />);

    await user.click(screen.getByRole('switch'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
