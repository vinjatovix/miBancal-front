import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BodySection from '../../../../src/shared/components/BodySection/BodySection';

describe('BodySection component', () => {
  it('renders section title and content without icon', () => {
    render(
      <BodySection title="Descripción">
        <p>Contenido de prueba</p>
      </BodySection>
    );

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Descripción'
    });
    const content = screen.getByText('Contenido de prueba');
    const section = screen.getByTestId('section-descripción');

    expect(heading).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(section).toBeInTheDocument();
  });

  it('renders decorative icon when icon prop is provided', () => {
    const { container } = render(
      <BodySection title="Descripción" icon="description">
        <p>Contenido con icono</p>
      </BodySection>
    );

    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'Descripción'
    });
    const svg = container.querySelector('svg');

    expect(heading).toBeInTheDocument();
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('generates clean data-testid without emoji or icon leakage', () => {
    render(
      <BodySection title="Aspectos destacados" icon="auto_awesome">
        <p>Contenido</p>
      </BodySection>
    );

    const section = screen.getByTestId('section-aspectos destacados');

    expect(section).toBeInTheDocument();
  });
});
