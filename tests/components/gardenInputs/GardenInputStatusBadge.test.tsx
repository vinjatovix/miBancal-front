import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import GardenInputStatusBadge from '../../../src/components/gardenInputs/GardenInputStatusBadge/GardenInputStatusBadge';

describe('GardenInputStatusBadge', () => {
  it('renders deleted badge when status is deleted', () => {
    render(<GardenInputStatusBadge status="deleted" />);

    const badge = screen.getByText('Eliminado');
    expect(badge).toBeInTheDocument();
  });

  it.each(['active', undefined] as const)(
    'renders nothing when status is %s',
    (status) => {
      const { container } = render(<GardenInputStatusBadge status={status} />);

      expect(container).toBeEmptyDOMElement();
    }
  );
});
