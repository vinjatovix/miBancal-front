import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Badge from '../../../../src/shared/components/Badge/Badge';

describe('Badge', () => {
  it('hides the icon element from assistive technologies with aria-hidden', () => {
    const { container } = render(<Badge icon="label">Solanáceas</Badge>);

    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders children text as badge content', () => {
    render(<Badge>Solanáceas</Badge>);

    const badgeContent = screen.getByText('Solanáceas');

    expect(badgeContent).toBeInTheDocument();
  });

  it('applies the deleted variant class', () => {
    render(<Badge variant="deleted">Borrada</Badge>);

    expect(screen.getByText('Borrada')).toHaveClass('badge', 'badge--deleted');
  });
});
