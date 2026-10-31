import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MonthChips from '../../../../../src/pages/plants/PlantDetail/components/MonthChips';

const SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic'
];

const LONG = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
];

function chipOf(short: string) {
  return screen.getByText(short).parentElement;
}

function activeChips(container: HTMLElement) {
  return container.querySelectorAll('.month-chip--active');
}

describe('MonthChips', () => {
  it('shows the abbreviations hidden from assistive technology', () => {
    render(<MonthChips months={[1, 2]} hemisphere="north" />);

    for (const short of SHORT) {
      expect(screen.getByText(short)).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('announces the full month names', () => {
    render(<MonthChips months={[1, 2]} hemisphere="north" />);

    for (const long of LONG) {
      expect(screen.getByText(long)).toHaveClass('sr-only');
    }
  });

  it('marks only the months of the data in the north', () => {
    const { container } = render(
      <MonthChips months={[1, 2]} hemisphere="north" />
    );

    expect(chipOf('Ene')).toHaveClass('month-chip--active');
    expect(chipOf('Feb')).toHaveClass('month-chip--active');
    expect(activeChips(container)).toHaveLength(2);
  });

  it('marks the display month mapped to the data month in the south', () => {
    const { container } = render(
      <MonthChips months={[7]} hemisphere="south" />
    );

    expect(chipOf('Ene')).toHaveClass('month-chip--active');
    expect(activeChips(container)).toHaveLength(1);
  });

  it('ignores a month out of range', () => {
    const { container } = render(
      <MonthChips months={[13]} hemisphere="north" />
    );

    expect(activeChips(container)).toHaveLength(0);
  });
});
