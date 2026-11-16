import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PlantNotes from '../../../../../src/pages/plants/PlantDetail/components/PlantNotes';
import { buildPlant } from '../../../../fixtures/plants/buildPlant';

describe('PlantNotes component', () => {
  it('renders heading and decorative edit_note icon for each note item', () => {
    const plant = buildPlant({
      knowledge: {
        ...buildPlant().knowledge,
        notes: ['Nota agronómica 1', 'Nota agronómica 2']
      }
    });

    const { container } = render(<PlantNotes plant={plant} />);

    const heading = screen.getByRole('heading', { level: 2, name: 'Notas' });
    const firstNote = screen.getByText('Nota agronómica 1');
    const secondNote = screen.getByText('Nota agronómica 2');
    const noteIcons = container.querySelectorAll('li svg');

    expect(heading).toBeInTheDocument();
    expect(firstNote).toBeInTheDocument();
    expect(secondNote).toBeInTheDocument();
    expect(noteIcons).toHaveLength(2);
  });

  it('renders nothing when notes list is empty', () => {
    const plant = buildPlant({
      knowledge: {
        ...buildPlant().knowledge,
        notes: []
      }
    });

    const { container } = render(<PlantNotes plant={plant} />);

    expect(container).toBeEmptyDOMElement();
  });
});
