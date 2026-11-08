import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import LayoutModeSegmentedControl from '../../../../src/pages/locations/LocationLayoutPage/components/LayoutModeSegmentedControl';

describe('LayoutModeSegmentedControl', () => {
  it('renders a radiogroup with accessible label and three radio options', () => {
    render(<LayoutModeSegmentedControl mode="read" onChange={vi.fn()} />);

    const radiogroup = screen.getByRole('radiogroup', {
      name: 'Modo del diseñador'
    });
    const radios = screen.getAllByRole('radio');

    expect(radiogroup).toBeInTheDocument();
    expect(radios).toHaveLength(3);
    expect(screen.getByRole('radio', { name: /Ver/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Colocar/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Sembrar/i })).toBeInTheDocument();
  });

  it('marks active mode with aria-checked true and others with aria-checked false', () => {
    render(<LayoutModeSegmentedControl mode="position" onChange={vi.fn()} />);

    const viewRadio = screen.getByRole('radio', { name: /Ver/i });
    const positionRadio = screen.getByRole('radio', { name: /Colocar/i });
    const plantingRadio = screen.getByRole('radio', { name: /Sembrar/i });

    expect(positionRadio).toHaveAttribute('aria-checked', 'true');
    expect(viewRadio).toHaveAttribute('aria-checked', 'false');
    expect(plantingRadio).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange with selected mode when an inactive radio is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<LayoutModeSegmentedControl mode="read" onChange={onChange} />);

    await user.click(screen.getByRole('radio', { name: /Sembrar/i }));

    expect(onChange).toHaveBeenCalledWith('plants');
  });

  it('navigates between radios with arrow keys and updates selection', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<LayoutModeSegmentedControl mode="read" onChange={onChange} />);

    const viewRadio = screen.getByRole('radio', { name: /Ver/i });
    viewRadio.focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('position');
  });

  it('wraps around to the first option when ArrowRight is pressed on the last option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<LayoutModeSegmentedControl mode="plants" onChange={onChange} />);

    const plantsRadio = screen.getByRole('radio', { name: /Sembrar/i });
    plantsRadio.focus();
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith('read');
  });
});
