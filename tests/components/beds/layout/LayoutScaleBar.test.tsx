import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LayoutScaleBar from '../../../../src/components/beds/layout/LayoutScaleBar';

describe('LayoutScaleBar', () => {
  it('renders scale bar container with aria-hidden attribute', () => {
    const { container } = render(
      <LayoutScaleBar viewBox="0 0 1000 1000" zoom={1} />
    );

    const scaleBar = container.querySelector('.layout-scale-bar');
    expect(scaleBar).toBeInTheDocument();
    expect(scaleBar).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders scale ruler when container has nonzero dimensions', () => {
    const originalGetBoundingClientRect =
      HTMLDivElement.prototype.getBoundingClientRect;
    HTMLDivElement.prototype.getBoundingClientRect = () => ({
      width: 800,
      height: 600,
      top: 0,
      left: 0,
      right: 800,
      bottom: 600,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    try {
      const { container } = render(
        <LayoutScaleBar viewBox="0 0 1000 1000" zoom={1} />
      );

      const ruler = container.querySelector('.layout-scale-bar__ruler');
      expect(ruler).toBeInTheDocument();
      expect(ruler).toHaveStyle({ width: '126px' });
      expect(screen.getByText('2.1 m')).toBeInTheDocument();
    } finally {
      HTMLDivElement.prototype.getBoundingClientRect =
        originalGetBoundingClientRect;
    }
  });
});
