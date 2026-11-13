import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home from '../../src/pages/Home';

describe('Home Page', () => {
  it('renders brand title and contact email link', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'MiBancal' })
    ).toBeInTheDocument();
    const emailLink = screen.getByRole('link', { name: 'hola@mibancal.app' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:hola@mibancal.app');
  });

  it('does not render github issues links', () => {
    render(<Home />);

    expect(screen.queryByText(/O abre un issue en/i)).toBeNull();
    expect(
      screen.queryByRole('link', { name: /github\.com.*issues/i })
    ).toBeNull();
  });
});
