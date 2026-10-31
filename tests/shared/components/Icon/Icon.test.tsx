import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Icon from '../../../../src/shared/components/Icon/Icon';

describe('Icon component - decorative rendering', () => {
  it('renders decorative svg with aria-hidden and without accessible role', () => {
    const { container } = render(<Icon name="eco" decorative />);

    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
    expect(svg).not.toHaveAttribute('aria-label');
  });

  it('renders standard svg attributes with 36x36 viewBox and 1.25em dimensions', () => {
    const { container } = render(<Icon name="eco" decorative />);

    const svg = container.querySelector('svg');

    expect(svg).toHaveAttribute('viewBox', '0 0 36 36');
    expect(svg).toHaveAttribute('width', '1.25em');
    expect(svg).toHaveAttribute('height', '1.25em');
    expect(svg).toHaveAttribute('focusable', 'false');
  });

  it('renders child vector elements inside svg', () => {
    const { container } = render(<Icon name="eco" decorative />);

    const paths = container.querySelectorAll('path');

    expect(paths.length).toBeGreaterThan(0);
  });

  it('applies default icon class', () => {
    const { container } = render(<Icon name="eco" decorative />);

    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('icon');
  });

  it('appends custom className when provided', () => {
    const { container } = render(
      <Icon name="eco" decorative className="test-custom-class" />
    );

    const svg = container.querySelector('svg');

    expect(svg).toHaveClass('icon', 'test-custom-class');
  });
});

describe('Icon component - semantic rendering', () => {
  it('renders semantic svg with role img and aria-label', () => {
    render(<Icon name="lock" label="Acceso seguro" />);

    const icon = screen.getByRole('img', { name: 'Acceso seguro' });

    expect(icon).toBeInTheDocument();
    expect(icon).not.toHaveAttribute('aria-hidden');
  });

  it('renders child vector elements for semantic icon', () => {
    render(<Icon name="lock" label="Acceso seguro" />);

    const icon = screen.getByRole('img', { name: 'Acceso seguro' });
    const paths = icon.querySelectorAll('path');

    expect(paths.length).toBeGreaterThan(0);
  });
});

describe('Icon component - password visibility glyphs', () => {
  it.each([['visibility'], ['visibility_off']] as const)(
    'renders %s glyph vector paths with currentColor stroke',
    (iconName) => {
      const { container } = render(<Icon name={iconName} decorative />);

      const path = container.querySelector('path');

      expect(path).toHaveAttribute('stroke', 'currentColor');
    }
  );
});
