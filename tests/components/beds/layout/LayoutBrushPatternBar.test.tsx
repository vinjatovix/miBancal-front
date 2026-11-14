import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutBrushPatternBar from '../../../../src/components/beds/layout/LayoutBrushPatternBar';

describe('LayoutBrushPatternBar', () => {
  it('renders the brush pattern options including individual', () => {
    render(
      <LayoutBrushPatternBar
        activePattern="double-row"
        onSelectPattern={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Individual' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Hilera simple' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Doble hilera' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Tresbolillo (triangular)' })
    ).toBeInTheDocument();
  });

  it('marks the active pattern with aria-pressed true', () => {
    render(
      <LayoutBrushPatternBar
        activePattern="double-row"
        onSelectPattern={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', { name: 'Doble hilera' })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: 'Hilera simple' })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('invokes onSelectPattern when clicking an option', async () => {
    const user = userEvent.setup();
    const onSelectPattern = vi.fn();

    render(
      <LayoutBrushPatternBar
        activePattern="single-row"
        onSelectPattern={onSelectPattern}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Doble hilera' }));

    expect(onSelectPattern).toHaveBeenCalledWith('double-row');
  });

  it('disables all options when disabled prop is true', () => {
    render(
      <LayoutBrushPatternBar
        activePattern="single-row"
        onSelectPattern={vi.fn()}
        disabled={true}
      />
    );

    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled();
    }
  });

  it('hides header label and wraps option labels in sr-only when isMobile is true', () => {
    const { container } = render(
      <LayoutBrushPatternBar
        activePattern="single-row"
        onSelectPattern={vi.fn()}
        isMobile
      />
    );

    expect(
      container.querySelector('.layout-brush-pattern-bar__label')
    ).toBeNull();

    const optionLabels = container.querySelectorAll(
      '.layout-brush-pattern-bar__option span'
    );
    expect(optionLabels.length).toBeGreaterThan(0);
    for (const span of optionLabels) {
      expect(span).toHaveClass('sr-only');
    }

    const button = screen.getByRole('button', { name: 'Hilera simple' });
    expect(button).toHaveAttribute('aria-label', 'Hilera simple');
    expect(button).toHaveAttribute('title', 'Hilera simple');
  });

  it('renders visible header label and standard option labels when isMobile is false or omitted', () => {
    const { container } = render(
      <LayoutBrushPatternBar
        activePattern="single-row"
        onSelectPattern={vi.fn()}
      />
    );

    expect(
      container.querySelector('.layout-brush-pattern-bar__label')
    ).toBeInTheDocument();

    const optionLabels = container.querySelectorAll(
      '.layout-brush-pattern-bar__option span'
    );
    for (const span of optionLabels) {
      expect(span).not.toHaveClass('sr-only');
    }
  });
});
