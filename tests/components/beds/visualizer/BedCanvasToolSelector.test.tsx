import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { BedCanvasToolSelector } from '../../../../src/components/beds/visualizer/BedCanvasToolSelector';
import '../../../../src/i18n/messages/beds';

describe('BedCanvasToolSelector', () => {
  it('renders all main tool buttons in the toolbar', () => {
    render(
      <BedCanvasToolSelector
        activeMode="plant-single"
        activeBrushPattern="single-row"
        onSelectMode={vi.fn()}
        onSelectBrushPattern={vi.fn()}
      />
    );

    expect(
      screen.getByRole('toolbar', {
        name: 'Herramientas de siembra y selección'
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Seleccionar y mover en grupo' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Siembra individual' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Brochas de siembra' })
    ).toBeInTheDocument();
  });

  it('calls onSelectMode when clicking a mode button', async () => {
    const onSelectMode = vi.fn();
    const user = userEvent.setup();

    render(
      <BedCanvasToolSelector
        activeMode="plant-single"
        activeBrushPattern="single-row"
        onSelectMode={onSelectMode}
        onSelectBrushPattern={vi.fn()}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Brochas de siembra' })
    );

    expect(onSelectMode).toHaveBeenCalledWith('brush');
  });

  it('renders pattern buttons when activeMode is brush', () => {
    render(
      <BedCanvasToolSelector
        activeMode="brush"
        activeBrushPattern="double-row"
        onSelectMode={vi.fn()}
        onSelectBrushPattern={vi.fn()}
      />
    );

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

  it('calls onSelectBrushPattern when clicking a brush pattern button', async () => {
    const onSelectBrushPattern = vi.fn();
    const user = userEvent.setup();

    render(
      <BedCanvasToolSelector
        activeMode="brush"
        activeBrushPattern="single-row"
        onSelectMode={vi.fn()}
        onSelectBrushPattern={onSelectBrushPattern}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Tresbolillo (triangular)' })
    );

    expect(onSelectBrushPattern).toHaveBeenCalledWith('staggered-triangle');
  });

  it('disables all buttons when disabled prop is true', () => {
    render(
      <BedCanvasToolSelector
        activeMode="brush"
        activeBrushPattern="single-row"
        onSelectMode={vi.fn()}
        onSelectBrushPattern={vi.fn()}
        disabled
      />
    );

    expect(
      screen.getByRole('button', { name: 'Seleccionar y mover en grupo' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Hilera simple' })
    ).toBeDisabled();
  });

  it('renders association toggle button and calls onToggleAssociations when clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <BedCanvasToolSelector
        activeMode="plant-single"
        activeBrushPattern="single-row"
        onSelectMode={vi.fn()}
        onSelectBrushPattern={vi.fn()}
        showAssociations={true}
        onToggleAssociations={onToggle}
      />
    );

    const toggleButton = screen.getByRole('button', {
      name: /asociaciones biológicas/i
    });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');

    await user.click(toggleButton);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders filter mode button and toggles detrimental-only mode', async () => {
    const onSelectFilter = vi.fn();
    const user = userEvent.setup();

    render(
      <BedCanvasToolSelector
        activeMode="plant-single"
        activeBrushPattern="single-row"
        onSelectMode={vi.fn()}
        onSelectBrushPattern={vi.fn()}
        showAssociations={true}
        associationFilterMode="all"
        onToggleAssociations={vi.fn()}
        onSelectAssociationFilterMode={onSelectFilter}
      />
    );

    const filterButton = screen.getByRole('button', {
      name: /solo incompatibilidades/i
    });
    expect(filterButton).toBeInTheDocument();
    expect(filterButton).toHaveAttribute('aria-pressed', 'false');

    await user.click(filterButton);

    expect(onSelectFilter).toHaveBeenCalledWith('detrimental_only');
  });
});
