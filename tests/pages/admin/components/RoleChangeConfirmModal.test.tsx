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

  it.each([
    [
      'revoking admin from a user with admin and collaborator',
      ['user', 'admin', 'collaborator'] as const,
      ['user', 'collaborator'] as const,
      [
        'Administrador (admin)',
        'Colaborador (collaborator)',
        'Usuario estándar (user)'
      ],
      ['Colaborador (collaborator)', 'Usuario estándar (user)'],
      /revocar los permisos de administrador al usuario testuser/i
    ],
    [
      'revoking collaborator from a user with admin and collaborator',
      ['user', 'admin', 'collaborator'] as const,
      ['user', 'admin'] as const,
      [
        'Administrador (admin)',
        'Colaborador (collaborator)',
        'Usuario estándar (user)'
      ],
      ['Administrador (admin)', 'Usuario estándar (user)'],
      /revocar los permisos de colaborador al usuario testuser/i
    ]
  ])(
    'renders all current and target role pills and displays correct prompt when %s',
    (
      _,
      currentRoles,
      targetRoles,
      expectedCurrent,
      expectedTarget,
      expectedPrompt
    ) => {
      const { container } = render(
        <RoleChangeConfirmModal
          isOpen={true}
          onConfirm={vi.fn()}
          onCancel={vi.fn()}
          username="testuser"
          currentRoles={currentRoles}
          targetRoles={targetRoles}
        />
      );

      const currentPills = container.querySelectorAll(
        '.admin-modal-roles-list--current .admin-modal-role-pill'
      );
      const targetPills = container.querySelectorAll(
        '.admin-modal-roles-list--target .admin-modal-role-pill'
      );

      expect(Array.from(currentPills).map((p) => p.textContent)).toEqual(
        expectedCurrent
      );
      expect(Array.from(targetPills).map((p) => p.textContent)).toEqual(
        expectedTarget
      );
      expect(screen.getByText(expectedPrompt)).toBeInTheDocument();
    }
  );
});
