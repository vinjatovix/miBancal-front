import { render, screen } from '@testing-library/react';

import PlantStatusBadge from '../../../../src/components/plants/PlantStatusBadge/PlantStatusBadge';

describe('PlantStatusBadge', () => {
  it('marca una planta borrada con el texto Borrada', () => {
    render(<PlantStatusBadge status="DELETED" />);

    const badge = screen.getByText('Borrada');

    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass('badge--deleted');
  });

  it('renders nothing for an active plant', () => {
    const { container } = render(<PlantStatusBadge status="ACTIVE" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing if status is missing', () => {
    const { container } = render(<PlantStatusBadge />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing nor i18n paths with an unknown status', () => {
    const { container } = render(
      // @ts-expect-error -- simula un estado que el contrato no declara
      <PlantStatusBadge status="ARCHIVED" />
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/statusValues/)).not.toBeInTheDocument();
  });
});
