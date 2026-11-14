import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import SnapToggle from '../../../../src/components/beds/layout/SnapToggle';

describe('SnapToggle', () => {
  it('exposes an accessible switch reflecting the enabled state', () => {
    render(<SnapToggle enabled onToggle={vi.fn()} glyph="magnet-grid" />);

    const toggle = screen.getByRole('switch', {
      name: 'Ajuste magnético a bancales vecinos'
    });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
  });

  it('reflects the disabled snap state', () => {
    render(
      <SnapToggle enabled={false} onToggle={vi.fn()} glyph="magnet-grid" />
    );

    expect(
      screen.getByRole('switch', {
        name: 'Ajuste magnético a bancales vecinos'
      })
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('invokes onToggle when pressed', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <SnapToggle enabled={false} onToggle={onToggle} glyph="magnet-grid" />
    );

    await user.click(screen.getByRole('switch'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it.each([
    { glyph: 'magnet-grid', label: 'Ajustar a la rejilla' },
    { glyph: 'magnet-beds', label: 'Ajustar a bancales vecinos' }
  ] as const)('renders the U-magnet glyph for $label', ({ glyph, label }) => {
    const { container } = render(
      <SnapToggle enabled onToggle={vi.fn()} glyph={glyph} label={label} />
    );

    const toggle = screen.getByRole('switch', { name: label });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(container.querySelector('svg.layout-glyph')).not.toBeNull();
  });

  it('renders short label when iconOnly is false or omitted', () => {
    render(
      <SnapToggle
        enabled
        onToggle={vi.fn()}
        glyph="magnet-grid"
        shortLabel="Rejilla"
      />
    );

    expect(screen.getByText('Rejilla')).toBeInTheDocument();
  });

  it('suppresses visible short label but preserves accessible label when iconOnly is true', () => {
    render(
      <SnapToggle
        enabled
        onToggle={vi.fn()}
        glyph="magnet-grid"
        label="Ajustar a la rejilla"
        shortLabel="Rejilla"
        iconOnly
      />
    );

    const toggle = screen.getByRole('switch', { name: 'Ajustar a la rejilla' });
    expect(toggle).toBeInTheDocument();
    expect(screen.queryByText('Rejilla')).not.toBeInTheDocument();
  });
});
