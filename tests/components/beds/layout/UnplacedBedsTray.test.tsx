import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import UnplacedBedsTray from '../../../../src/components/beds/layout/UnplacedBedsTray';
import {
  buildUnplacedBed,
  buildUnplacedBed as makeBed
} from '../../../fixtures/locations/buildLocationLayout';

const BEDS = [
  makeBed({ id: 'bed-1', name: 'Vivero' }),
  buildUnplacedBed({ id: 'bed-2', name: 'Semillero' })
];

describe('UnplacedBedsTray', () => {
  it('renders a labelled list separated from the canvas', () => {
    render(<UnplacedBedsTray beds={BEDS} mode="read" />);

    const region = screen.getByRole('region', {
      name: 'Bancales sin colocar'
    });
    expect(region).toBeInTheDocument();
    expect(screen.getByText('Vivero')).toBeInTheDocument();
    expect(screen.getByText('Semillero')).toBeInTheDocument();
  });

  it('shows an empty message when there are no unplaced beds', () => {
    render(<UnplacedBedsTray beds={[]} mode="read" />);

    expect(
      screen.getByText('No hay bancales sin colocar.')
    ).toBeInTheDocument();
  });

  it('invokes onPlace in position mode', async () => {
    const onPlace = vi.fn();
    const user = userEvent.setup();

    render(<UnplacedBedsTray beds={BEDS} mode="position" onPlace={onPlace} />);

    await user.click(
      screen.getByRole('button', {
        name: 'Colocar el bancal Vivero en el plano'
      })
    );

    expect(onPlace).toHaveBeenCalledWith('bed-1');
  });

  it('does not render place actions in read mode', () => {
    render(<UnplacedBedsTray beds={BEDS} mode="read" />);

    expect(
      screen.queryByRole('button', { name: /Colocar el bancal/ })
    ).toBeNull();
  });
});
