import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { UserDetailsCard } from '../../../../src/pages/admin/components/UserDetailsCard';
import type { UserRole } from '../../../../src/types/auth';

describe('UserDetailsCard', () => {
  it('renders the username', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'] as const
    };

    render(<UserDetailsCard user={user} />);

    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('renders the email address', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'] as const
    };

    render(<UserDetailsCard user={user} />);

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('does not display the uuid value as text', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'] as const
    };

    render(<UserDetailsCard user={user} />);

    expect(
      screen.queryByText('550e8400-e29b-41d4-a716-446655440000')
    ).not.toBeInTheDocument();
  });

  it('renders the copy button for account id', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'] as const
    };

    render(<UserDetailsCard user={user} />);

    expect(
      screen.getByRole('button', { name: /copiar id/i })
    ).toBeInTheDocument();
  });

  it('copies the uuid value to clipboard when copy button is clicked', () => {
    const user = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['user'] as const
    };
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock }
    });

    render(<UserDetailsCard user={user} />);
    fireEvent.click(screen.getByRole('button', { name: /copiar id/i }));

    expect(writeTextMock).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440000'
    );
  });

  it.each([
    ['admin', 'admin-role-tag--admin'],
    ['user', 'admin-role-tag--user'],
    ['collaborator', 'admin-role-tag--collaborator']
  ] as const)(
    'renders role %s with modifier class %s',
    (role: UserRole, expectedClass: string) => {
      const user = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        username: 'testuser',
        email: 'test@example.com',
        roles: [role] as const
      };

      render(<UserDetailsCard user={user} />);

      expect(screen.getByText(role)).toHaveClass(expectedClass);
    }
  );
});
