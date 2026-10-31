import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import SliderFilter from '../../../src/components/plants/SliderFilter';

describe('SliderFilter component', () => {
  it('renders slider label and decorative icon when provided', () => {
    const { container } = render(
      <SliderFilter
        label="Altura"
        icon="straighten"
        value={150}
        min={10}
        max={300}
        step={10}
        onChange={vi.fn()}
        onCommit={vi.fn()}
      />
    );

    const slider = screen.getByRole('slider', { name: /Altura 150/ });
    const svg = container.querySelector('label svg');

    expect(slider).toBeInTheDocument();
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders accessible reset button when value is set', () => {
    render(
      <SliderFilter
        label="Altura"
        value={150}
        min={10}
        max={300}
        step={10}
        onChange={vi.fn()}
        onCommit={vi.fn()}
      />
    );

    const resetButton = screen.getByRole('button', {
      name: 'Quitar filtro de Altura'
    });

    expect(resetButton).toBeInTheDocument();
  });

  it('does not render reset button when value is null', () => {
    render(
      <SliderFilter
        label="Altura"
        value={null}
        min={10}
        max={300}
        step={10}
        onChange={vi.fn()}
        onCommit={vi.fn()}
      />
    );

    const resetButton = screen.queryByRole('button', {
      name: /Quitar filtro/
    });

    expect(resetButton).not.toBeInTheDocument();
  });

  it('clears value on reset button click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onCommit = vi.fn();
    render(
      <SliderFilter
        label="Altura"
        value={150}
        min={10}
        max={300}
        step={10}
        onChange={onChange}
        onCommit={onCommit}
      />
    );

    const resetButton = screen.getByRole('button', {
      name: 'Quitar filtro de Altura'
    });
    await user.click(resetButton);

    expect(onChange).toHaveBeenCalledWith(null);
    expect(onCommit).toHaveBeenCalledWith(null);
  });
});
