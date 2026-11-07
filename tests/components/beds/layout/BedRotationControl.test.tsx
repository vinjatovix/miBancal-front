import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import BedRotationControl from '../../../../src/components/beds/layout/BedRotationControl';

describe('BedRotationControl', () => {
  it('renders a labelled integer field bounded to 0-359 with a one degree step', () => {
    render(<BedRotationControl value={90} onChange={vi.fn()} />);

    const field = screen.getByRole('spinbutton', {
      name: 'Rotación en grados'
    });
    expect(field).toHaveValue(90);
    expect(field).toHaveAttribute('min', '0');
    expect(field).toHaveAttribute('max', '359');
    expect(field).toHaveAttribute('step', '1');
  });

  it('invokes onChange with the numeric value', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<BedRotationControl value={0} onChange={onChange} />);

    const field = screen.getByRole('spinbutton', {
      name: 'Rotación en grados'
    });
    await user.clear(field);
    await user.type(field, '7');

    expect(onChange).toHaveBeenLastCalledWith(7);
  });

  it('is disabled when requested', () => {
    render(<BedRotationControl value={0} onChange={vi.fn()} disabled />);

    expect(
      screen.getByRole('spinbutton', { name: 'Rotación en grados' })
    ).toBeDisabled();
  });
});
