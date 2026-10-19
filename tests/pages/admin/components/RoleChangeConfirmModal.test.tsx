import { render, screen, fireEvent } from '@testing-library/react';
import { RoleChangeConfirmModal } from '../../../../src/pages/admin/components/RoleChangeConfirmModal';
import { describe, it, expect, vi } from 'vitest';

describe('RoleChangeConfirmModal', () => {
  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <RoleChangeConfirmModal
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        username="testuser"
        action="grant"
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <RoleChangeConfirmModal
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        username="testuser"
        action="grant"
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('disables action buttons when isLoading is true', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <RoleChangeConfirmModal
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        username="testuser"
        action="grant"
        isLoading={true}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirmar/i });
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
  });

  it('prevents onCancel on escape key when isLoading is true', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <RoleChangeConfirmModal
        isOpen={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
        username="testuser"
        action="grant"
        isLoading={true}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onCancel).not.toHaveBeenCalled();
  });

  it.each([
    { action: 'grant' as const, expectedClass: 'admin-modal-role-pill--user' },
    { action: 'revoke' as const, expectedClass: 'admin-modal-role-pill--admin' }
  ])(
    'assigns correct semantic class to current role pill on $action',
    ({ action, expectedClass }) => {
      const { container } = render(
        <RoleChangeConfirmModal
          isOpen={true}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          username="testuser"
          action={action}
        />
      );

      const currentPill = container.querySelector(
        '.admin-modal-role-pill--current-slot'
      );

      expect(currentPill).toHaveClass(expectedClass);
    }
  );

  it.each([
    { action: 'grant' as const, expectedClass: 'admin-modal-role-pill--admin' },
    { action: 'revoke' as const, expectedClass: 'admin-modal-role-pill--user' }
  ])(
    'assigns correct semantic class to target role pill on $action',
    ({ action, expectedClass }) => {
      const { container } = render(
        <RoleChangeConfirmModal
          isOpen={true}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          username="testuser"
          action={action}
        />
      );

      const targetPill = container.querySelector(
        '.admin-modal-role-pill--target-slot'
      );

      expect(targetPill).toHaveClass(expectedClass);
    }
  );

  it.each([
    {
      action: 'grant' as const,
      expectedClass: 'admin-modal-role-pill--collaborator'
    },
    { action: 'revoke' as const, expectedClass: 'admin-modal-role-pill--user' }
  ])(
    'assigns correct semantic class to target role pill on $action collaborator',
    ({ action, expectedClass }) => {
      const { container } = render(
        <RoleChangeConfirmModal
          isOpen={true}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          username="testuser"
          action={action}
          role="collaborator"
        />
      );

      const targetPill = container.querySelector(
        '.admin-modal-role-pill--target-slot'
      );

      expect(targetPill).toHaveClass(expectedClass);
    }
  );

  it.each([
    { action: 'grant' as const, expectedClass: 'admin-modal-role-pill--user' },
    {
      action: 'revoke' as const,
      expectedClass: 'admin-modal-role-pill--collaborator'
    }
  ])(
    'assigns correct semantic class to current role pill on $action collaborator',
    ({ action, expectedClass }) => {
      const { container } = render(
        <RoleChangeConfirmModal
          isOpen={true}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          username="testuser"
          action={action}
          role="collaborator"
        />
      );

      const currentPill = container.querySelector(
        '.admin-modal-role-pill--current-slot'
      );

      expect(currentPill).toHaveClass(expectedClass);
    }
  );

  it.each([
    {
      action: 'grant' as const,
      expectedText: /otorgar permisos de colaborador/i
    },
    {
      action: 'revoke' as const,
      expectedText: /revocar los permisos de colaborador/i
    }
  ])(
    'displays descriptive prompt when $action collaborator',
    ({ action, expectedText }) => {
      render(
        <RoleChangeConfirmModal
          isOpen={true}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          username="testuser"
          action={action}
          role="collaborator"
        />
      );

      expect(screen.getByText(expectedText)).toBeInTheDocument();
    }
  );

  it('renders all current and target role pills when revoking admin from a user with admin and collaborator', () => {
    const { container } = render(
      <RoleChangeConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        username="testuser"
        currentRoles={['user', 'admin', 'collaborator']}
        targetRoles={['user', 'collaborator']}
      />
    );

    const currentPills = container.querySelectorAll(
      '.admin-modal-roles-list--current .admin-modal-role-pill'
    );
    const targetPills = container.querySelectorAll(
      '.admin-modal-roles-list--target .admin-modal-role-pill'
    );

    expect(Array.from(currentPills).map((p) => p.textContent)).toEqual([
      'Administrador (admin)',
      'Colaborador (collaborator)',
      'Usuario estándar (user)'
    ]);
    expect(Array.from(targetPills).map((p) => p.textContent)).toEqual([
      'Colaborador (collaborator)',
      'Usuario estándar (user)'
    ]);
  });

  it('renders all current and target role pills when revoking collaborator from a user with admin and collaborator', () => {
    const { container } = render(
      <RoleChangeConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        username="testuser"
        currentRoles={['user', 'admin', 'collaborator']}
        targetRoles={['user', 'admin']}
      />
    );

    const currentPills = container.querySelectorAll(
      '.admin-modal-roles-list--current .admin-modal-role-pill'
    );
    const targetPills = container.querySelectorAll(
      '.admin-modal-roles-list--target .admin-modal-role-pill'
    );

    expect(Array.from(currentPills).map((p) => p.textContent)).toEqual([
      'Administrador (admin)',
      'Colaborador (collaborator)',
      'Usuario estándar (user)'
    ]);
    expect(Array.from(targetPills).map((p) => p.textContent)).toEqual([
      'Administrador (admin)',
      'Usuario estándar (user)'
    ]);
  });

  it('displays revoke admin prompt when revoking admin from a user with admin and collaborator', () => {
    render(
      <RoleChangeConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        username="testuser"
        currentRoles={['user', 'admin', 'collaborator']}
        targetRoles={['user', 'collaborator']}
      />
    );

    expect(
      screen.getByText(
        /revocar los permisos de administrador al usuario testuser/i
      )
    ).toBeInTheDocument();
  });

  it('displays revoke collaborator prompt when revoking collaborator from a user with admin and collaborator', () => {
    render(
      <RoleChangeConfirmModal
        isOpen={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        username="testuser"
        currentRoles={['user', 'admin', 'collaborator']}
        targetRoles={['user', 'admin']}
      />
    );

    expect(
      screen.getByText(
        /revocar los permisos de colaborador al usuario testuser/i
      )
    ).toBeInTheDocument();
  });
});
