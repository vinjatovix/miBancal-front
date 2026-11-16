import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ToggleGroup from '../../../src/components/plants/ToggleGroup';

describe('ToggleGroup component', () => {
  it('renders group with label without icon', () => {
    render(
      <ToggleGroup
        label="Ciclo de vida"
        options={['annual', 'perennial']}
        value="annual"
        onChange={vi.fn()}
      />
    );

    const group = screen.getByRole('group', { name: 'Ciclo de vida' });

    expect(group).toBeInTheDocument();
  });

  it('renders decorative icon when icon prop is provided', () => {
    const { container } = render(
      <ToggleGroup
        label="Ciclo de vida"
        icon="recycling"
        options={['annual', 'perennial']}
        value="annual"
        onChange={vi.fn()}
      />
    );

    const group = screen.getByRole('group', { name: 'Ciclo de vida' });
    const svg = container.querySelector('svg');

    expect(group).toBeInTheDocument();
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onChange with selected option when button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ToggleGroup
        label="Ciclo de vida"
        options={['annual', 'perennial']}
        value="annual"
        onChange={onChange}
      />
    );

    const optionButton = screen.getByRole('button', { name: 'perennial' });
    await user.click(optionButton);

    expect(onChange).toHaveBeenCalledWith('perennial');
  });
});
