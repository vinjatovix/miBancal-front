import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { RoleManagementForm } from '../../../../src/pages/admin/components/RoleManagementForm';

describe('RoleManagementForm', () => {
  it('enables the save button and calls onSave with target roles when administrator role is toggled', () => {
    const onSave = vi.fn();
    const roles = ['user'] as const;

    render(<RoleManagementForm roles={roles} onSave={onSave} />);
    const checkbox = screen.getByLabelText(/administrador/i);
    fireEvent.click(checkbox);
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(['user', 'admin']);
  });

  it('resets role selection when reset button is clicked', () => {
    const roles = ['user'] as const;

    render(<RoleManagementForm roles={roles} onSave={vi.fn()} />);
    const checkbox = screen.getByLabelText(/administrador/i);
    fireEvent.click(checkbox);
    const resetButton = screen.getByRole('button', { name: /limpiar/i });
    fireEvent.click(resetButton);

    expect(checkbox).not.toBeChecked();
  });

  it('enables the save button and calls onSave with target roles when collaborator role is toggled', () => {
    const onSave = vi.fn();
    const roles = ['user'] as const;

    render(<RoleManagementForm roles={roles} onSave={onSave} />);
    const checkbox = screen.getByLabelText(/colaborador/i);
    fireEvent.click(checkbox);
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(['user', 'collaborator']);
  });

  it('enables the save button and calls onSave with all selected roles when both roles are toggled', () => {
    const onSave = vi.fn();
    const roles = ['user'] as const;

    render(<RoleManagementForm roles={roles} onSave={onSave} />);
    const adminCheckbox = screen.getByLabelText(/administrador/i);
    const collabCheckbox = screen.getByLabelText(/colaborador/i);
    fireEvent.click(adminCheckbox);
    fireEvent.click(collabCheckbox);
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    expect(onSave).toHaveBeenCalledWith(['user', 'admin', 'collaborator']);
  });

  it('resets collaborator selection when reset button is clicked', () => {
    const roles = ['user'] as const;

    render(<RoleManagementForm roles={roles} onSave={vi.fn()} />);
    const checkbox = screen.getByLabelText(/colaborador/i);
    fireEvent.click(checkbox);
    const resetButton = screen.getByRole('button', { name: /limpiar/i });
    fireEvent.click(resetButton);

    expect(checkbox).not.toBeChecked();
  });

  it('renders collaborator switch as checked when user already has collaborator role', () => {
    const roles = ['user', 'collaborator'] as const;

    render(<RoleManagementForm roles={roles} onSave={vi.fn()} />);
    const checkbox = screen.getByLabelText(/colaborador/i);

    expect(checkbox).toBeChecked();
  });

  it('keeps save button enabled and switch toggled after onSave is triggered', () => {
    const onSave = vi.fn();
    const roles = ['user'] as const;

    render(<RoleManagementForm roles={roles} onSave={onSave} />);
    const checkbox = screen.getByLabelText(/colaborador/i);
    fireEvent.click(checkbox);
    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    expect(saveButton).toBeEnabled();
    expect(checkbox).toBeChecked();
  });

  it('does not render warning about satellite devices', () => {
    const roles = ['user'] as const;

    render(<RoleManagementForm roles={roles} onSave={vi.fn()} />);

    expect(screen.queryByText(/satelital/i)).not.toBeInTheDocument();
  });

  it.each([
    ['admin', 'admin-role-code-tag--admin'],
    ['collaborator', 'admin-role-code-tag--collab']
  ] as const)(
    'renders role code badge for %s with modifier class %s',
    (roleCode: string, expectedClass: string) => {
      const roles = ['user'] as const;

      render(<RoleManagementForm roles={roles} onSave={vi.fn()} />);

      expect(screen.getByText(roleCode)).toHaveClass(expectedClass);
    }
  );
});
