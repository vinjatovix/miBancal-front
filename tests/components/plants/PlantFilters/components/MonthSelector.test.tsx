import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import MonthSelector from '../../../../../src/components/plants/PlantFilters/components/MonthSelector';

const MONTHS = [
  ['enero', 'Ene'],
  ['febrero', 'Feb'],
  ['marzo', 'Mar'],
  ['abril', 'Abr'],
  ['mayo', 'May'],
  ['junio', 'Jun'],
  ['julio', 'Jul'],
  ['agosto', 'Ago'],
  ['septiembre', 'Sep'],
  ['octubre', 'Oct'],
  ['noviembre', 'Nov'],
  ['diciembre', 'Dic']
];

describe('MonthSelector', () => {
  it('names each month in full and shows its abbreviation', () => {
    render(<MonthSelector hemisphere="north" value="" onChange={vi.fn()} />);

    MONTHS.forEach(([long, short], index) => {
      const button = screen.getByRole('button', { name: long });
      expect(button).toHaveTextContent(short);
      expect(button).toHaveAttribute(
        'data-testid',
        `month-button-${index + 1}`
      );
    });
    expect(screen.getAllByRole('button')).toHaveLength(12);
  });

  it('sends the selected month in the north', () => {
    const onChange = vi.fn();
    render(<MonthSelector hemisphere="north" value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'enero' }));

    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('sends the mapped month in the south', () => {
    const onChange = vi.fn();
    render(<MonthSelector hemisphere="south" value="" onChange={onChange} />);

    fireEvent.click(screen.getByRole('button', { name: 'enero' }));

    expect(onChange).toHaveBeenCalledWith('7');
  });

  it('marks the active month and clears it when pressed again', () => {
    const onChange = vi.fn();
    render(<MonthSelector hemisphere="north" value="3" onChange={onChange} />);

    const button = screen.getByRole('button', { name: 'marzo' });
    expect(button).toHaveClass('plant-filters__toggle--active');

    fireEvent.click(button);

    expect(onChange).toHaveBeenCalledWith('');
  });
});
