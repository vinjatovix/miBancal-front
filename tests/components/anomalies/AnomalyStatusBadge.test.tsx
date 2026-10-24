import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import AnomalyStatusBadge from '../../../src/components/anomalies/AnomalyStatusBadge/AnomalyStatusBadge';

describe('AnomalyStatusBadge', () => {
  it('muestra el badge para una anomalía eliminada', () => {
    render(<AnomalyStatusBadge status="DELETED" />);

    expect(screen.getByText('Eliminada')).toHaveClass('badge--deleted');
  });

  it.each(['ACTIVE', undefined] as const)(
    'no pinta nada para el estado %s',
    (status) => {
      const { container } = render(<AnomalyStatusBadge status={status} />);

      expect(container).toBeEmptyDOMElement();
    }
  );
});
