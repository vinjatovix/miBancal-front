import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import PasswordStrengthBar from '../../../../src/pages/auth/components/PasswordStrengthBar';

describe('PasswordStrengthBar', () => {
  it('renders nothing when password is empty', () => {
    const { container } = render(<PasswordStrengthBar password="" />);

    expect(container.firstChild).toBeNull();
  });

  it('renders weak indicator when password meets few criteria', () => {
    render(<PasswordStrengthBar password="abc" />);

    expect(screen.getByText('Débil')).toBeInTheDocument();
  });

  it('renders medium indicator when password meets intermediate criteria', () => {
    render(<PasswordStrengthBar password="Password12" />);

    expect(screen.getByText('Media')).toBeInTheDocument();
  });

  it('renders strong indicator when password meets all criteria', () => {
    render(<PasswordStrengthBar password="Password123!" />);

    expect(screen.getByText('Fuerte')).toBeInTheDocument();
  });
});
