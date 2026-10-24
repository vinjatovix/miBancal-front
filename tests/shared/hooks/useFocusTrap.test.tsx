import { useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useFocusTrap } from '../../../src/shared/hooks/useFocusTrap';

function TrapContainer({ isOpen }: { readonly isOpen: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, ref);

  return (
    <div ref={ref}>
      <button type="button">First</button>
      <input type="text" placeholder="Middle" />
      <button type="button">Last</button>
    </div>
  );
}

describe('useFocusTrap', () => {
  it('focuses the first focusable element when opened', () => {
    render(<TrapContainer isOpen={true} />);

    const firstButton = screen.getByRole('button', { name: 'First' });

    expect(document.activeElement).toBe(firstButton);
  });

  it('cycles focus from last element to first element on Tab', () => {
    render(<TrapContainer isOpen={true} />);
    const firstButton = screen.getByRole('button', { name: 'First' });
    const lastButton = screen.getByRole('button', { name: 'Last' });
    lastButton.focus();

    fireEvent.keyDown(lastButton, { key: 'Tab', shiftKey: false });

    expect(document.activeElement).toBe(firstButton);
  });

  it('cycles focus from first element to last element on Shift+Tab', () => {
    render(<TrapContainer isOpen={true} />);
    const firstButton = screen.getByRole('button', { name: 'First' });
    const lastButton = screen.getByRole('button', { name: 'Last' });
    firstButton.focus();

    fireEvent.keyDown(firstButton, { key: 'Tab', shiftKey: true });

    expect(document.activeElement).toBe(lastButton);
  });

  it('does not focus first element when isOpen is false', () => {
    render(<TrapContainer isOpen={false} />);

    const firstButton = screen.getByRole('button', { name: 'First' });

    expect(document.activeElement).not.toBe(firstButton);
  });
});
