import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import LayoutGlyph, {
  type LayoutGlyphName
} from '../../../../src/components/beds/layout/LayoutGlyph';

describe('LayoutGlyph', () => {
  it.each<LayoutGlyphName>([
    'undo',
    'redo',
    'fullscreen',
    'fullscreen-exit',
    'magnet-grid',
    'magnet-beds'
  ])('renders a decorative svg for the %s glyph', (name) => {
    const { container } = render(<LayoutGlyph name={name} />);

    const svg = container.querySelector('svg.layout-glyph');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg?.childElementCount).toBeGreaterThan(0);
  });

  it('applies an additional class name when provided', () => {
    const { container } = render(
      <LayoutGlyph name="fullscreen" className="custom-glyph" />
    );

    expect(container.querySelector('svg')).toHaveClass(
      'layout-glyph',
      'custom-glyph'
    );
  });
});
