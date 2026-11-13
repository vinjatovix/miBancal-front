import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DevBanner from '../../../src/components/layout/DevBanner/DevBanner';

vi.mock('../../../src/config/env', () => ({
  IS_DEV: true
}));

describe('DevBanner', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders development indicator when in dev environment', () => {
    render(<DevBanner />);

    expect(screen.getByText('development')).toBeInTheDocument();
  });

  it('renders nothing when not in dev environment', async () => {
    vi.resetModules();
    vi.doMock('../../../src/config/env', () => ({
      IS_DEV: false
    }));
    const { default: DynamicDevBanner } =
      await import('../../../src/components/layout/DevBanner/DevBanner');

    const { container } = render(<DynamicDevBanner />);

    expect(container.firstChild).toBeNull();
  });
});
