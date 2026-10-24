import { render, screen } from '@testing-library/react';

import PlantStatusBadge from '../../../../src/components/plants/PlantStatusBadge/PlantStatusBadge';

describe('PlantStatusBadge', () => {
  it('marca una planta borrada con el texto Borrada', () => {
    render(<PlantStatusBadge status="DELETED" />);

    const badge = screen.getByText('Borrada');

    expect(badge.tagName).toBe('SPAN');
    expect(badge).toHaveClass('badge--deleted');
  });

  it('no pinta nada para una planta activa', () => {
    const { container } = render(<PlantStatusBadge status="ACTIVE" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('no pinta nada si falta el estado', () => {
    const { container } = render(<PlantStatusBadge />);

    expect(container).toBeEmptyDOMElement();
  });

  it('no pinta nada ni rutas i18n con un estado desconocido', () => {
    const { container } = render(
      // @ts-expect-error -- simula un estado que el contrato no declara
      <PlantStatusBadge status="ARCHIVED" />
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText(/statusValues/)).not.toBeInTheDocument();
  });
});
