import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import PlantingToolSelector from '../../../../src/components/beds/visualizer/PlantingToolSelector';

describe('PlantingToolSelector', () => {
  it('renders select and brush tools as labelled icon buttons', () => {
    render(<PlantingToolSelector activeMode="brush" onSelectMode={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /Seleccionar y mover/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Brochas de siembra/i })
    ).toBeInTheDocument();
  });

  it('marks active tool with aria-pressed true and inactive with aria-pressed false', () => {
    render(<PlantingToolSelector activeMode="select" onSelectMode={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /Seleccionar y mover/i })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: /Brochas de siembra/i })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('invokes onSelectMode when clicking an inactive tool button', async () => {
    const user = userEvent.setup();
    const onSelectMode = vi.fn();

    render(
      <PlantingToolSelector activeMode="select" onSelectMode={onSelectMode} />
    );

    await user.click(
      screen.getByRole('button', { name: /Brochas de siembra/i })
    );

    expect(onSelectMode).toHaveBeenCalledWith('brush');
  });

  it('disables all buttons when disabled prop is true', () => {
    render(
      <PlantingToolSelector
        activeMode="brush"
        onSelectMode={vi.fn()}
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });
});
