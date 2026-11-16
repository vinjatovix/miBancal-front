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

  it.each([
    ['ArrowUp', false, 45, 46],
    ['ArrowRight', false, 45, 46],
    ['ArrowDown', false, 45, 44],
    ['ArrowLeft', false, 45, 44],
    ['ArrowUp', true, 45, 60],
    ['ArrowRight', true, 45, 60],
    ['ArrowDown', true, 45, 30],
    ['ArrowLeft', true, 45, 30],
    ['ArrowUp', false, 359, 0],
    ['ArrowDown', false, 0, 359],
    ['ArrowUp', true, 350, 5],
    ['ArrowDown', true, 10, 355]
  ])(
    'handles key %s with shift=%s from %i to %i',
    async (key, shiftKey, initialValue, expectedValue) => {
      const onChange = vi.fn();
      const user = userEvent.setup();

      render(<BedRotationControl value={initialValue} onChange={onChange} />);

      const field = screen.getByRole('spinbutton', {
        name: 'Rotación en grados'
      });
      await user.click(field);
      await user.keyboard(shiftKey ? `{Shift>}{${key}}{/Shift}` : `{${key}}`);

      expect(onChange).toHaveBeenCalledWith(expectedValue);
    }
  );
});
