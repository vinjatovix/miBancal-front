import {
  render,
  screen,
  fireEvent,
  waitFor,
  within
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import AdminDashboard from '../../../src/pages/admin/AdminDashboard';
import * as userService from '../../../src/services/users.service';
import { ToastProvider } from '../../../src/shared/toast/ToastContext';
import { toastStore } from '../../../src/shared/toast/toastStore';
import { t } from '../../../src/i18n/core/t';

vi.mock('../../../src/services/users.service');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

const renderDashboard = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AdminDashboard />
      </ToastProvider>
    </QueryClientProvider>
  );
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toastStore.clearToasts();
  });

  it('renders accessible page title heading', () => {
    renderDashboard();

    const heading = screen.getByRole('heading', {
      level: 1,
      name: /administración de usuarios/i
    });

    expect(heading).toBeInTheDocument();
  });

  it('searches for a user and displays user card', async () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'test',
      email: 'test@example.com',
      roles: ['user'] as const
    };
    vi.mocked(userService.lookupUser).mockResolvedValue({
      user: mockUser,
      etag: '"1"'
    });

    renderDashboard();

    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const button = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
  });

  it('displays error toast when user search fails', async () => {
    vi.mocked(userService.lookupUser).mockRejectedValue(
      new Error('User not found')
    );

    renderDashboard();

    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const button = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'notfound@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('dismisses error toast when close button is clicked', async () => {
    vi.mocked(userService.lookupUser).mockRejectedValue(
      new Error('User not found')
    );

    renderDashboard();

    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const button = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'notfound@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', {
      name: t('toast.close')
    });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('displays success toast after saving role change', async () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'test',
      email: 'test@example.com',
      roles: ['user'] as const
    };
    vi.mocked(userService.lookupUser).mockResolvedValue({
      user: mockUser,
      etag: '"1"'
    });
    vi.mocked(userService.changeUserRoles).mockResolvedValue({
      userRoles: {
        id: mockUser.id,
        roles: ['admin', 'user'],
        metadata: {
          createdAt: '2026-01-01T00:00:00Z',
          createdBy: 'admin',
          updatedAt: '2026-01-01T00:00:00Z',
          updatedBy: 'admin'
        }
      },
      etag: '"2"'
    });

    renderDashboard();

    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const searchButton = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/privilegios de administrador/i);
    fireEvent.click(checkbox);

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: /confirmar cambios/i
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(
        screen.getByText(t('admin.role_change_success_message'))
      ).toBeInTheDocument();
    });
  });

  it('opens confirm modal and displays success toast after saving collaborator role change', async () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'test',
      email: 'test@example.com',
      roles: ['user'] as const
    };
    vi.mocked(userService.lookupUser).mockResolvedValue({
      user: mockUser,
      etag: '"1"'
    });
    vi.mocked(userService.changeUserRoles).mockResolvedValue({
      userRoles: {
        id: mockUser.id,
        roles: ['collaborator', 'user'],
        metadata: {
          createdAt: '2026-01-01T00:00:00Z',
          createdBy: 'admin',
          updatedAt: '2026-01-01T00:00:00Z',
          updatedBy: 'admin'
        }
      },
      etag: '"2"'
    });

    renderDashboard();

    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const searchButton = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/colaborador agronómico/i);
    fireEvent.click(checkbox);

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: /confirmar cambios/i
    });
    expect(
      screen.getByText(/otorgar permisos de colaborador al usuario test/i)
    ).toBeInTheDocument();
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(userService.changeUserRoles).toHaveBeenCalledWith(
        mockUser.id,
        { add: ['collaborator'] },
        '"1"'
      );
      expect(
        screen.getByText(t('admin.role_change_success_message'))
      ).toBeInTheDocument();
    });
  });

  it('displays remaining collaborator role in confirm modal when revoking admin from user with both roles', async () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'test',
      email: 'test@example.com',
      roles: ['user', 'admin', 'collaborator'] as const
    };
    vi.mocked(userService.lookupUser).mockResolvedValue({
      user: mockUser,
      etag: '"1"'
    });
    vi.mocked(userService.changeUserRoles).mockResolvedValue({
      userRoles: {
        id: mockUser.id,
        roles: ['collaborator', 'user'],
        metadata: {
          createdAt: '2026-01-01T00:00:00Z',
          createdBy: 'admin',
          updatedAt: '2026-01-01T00:00:00Z',
          updatedBy: 'admin'
        }
      },
      etag: '"2"'
    });

    renderDashboard();

    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const searchButton = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/privilegios de administrador/i);
    fireEvent.click(checkbox);

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    const confirmButton = await screen.findByRole('button', {
      name: /confirmar cambios/i
    });
    expect(
      screen.getByText(/revocar los permisos de administrador al usuario test/i)
    ).toBeInTheDocument();
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(userService.changeUserRoles).toHaveBeenCalledWith(
        mockUser.id,
        { remove: ['admin'] },
        '"1"'
      );
      expect(
        screen.getByText(t('admin.role_change_success_message'))
      ).toBeInTheDocument();
    });
  });

  it('keeps switches toggled and save button enabled when modal is cancelled', async () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'test',
      email: 'test@example.com',
      roles: ['user'] as const
    };
    vi.mocked(userService.lookupUser).mockResolvedValue({
      user: mockUser,
      etag: '"1"'
    });

    renderDashboard();

    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const searchButton = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText(/colaborador agronómico/i);
    fireEvent.click(checkbox);

    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);

    const cancelButton = await screen.findByRole('button', {
      name: /cancelar/i
    });
    fireEvent.click(cancelButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(checkbox).toBeChecked();
    expect(saveButton).toBeEnabled();
  });

  it('redisplays error toast when retrying search after dismissing previous error', async () => {
    vi.mocked(userService.lookupUser).mockRejectedValue(
      new Error('User not found')
    );
    renderDashboard();
    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const button = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'notfound@example.com' } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    const closeButton = screen.getByRole('button', {
      name: t('toast.close')
    });
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('redisplays error toast when retrying role change after dismissing previous error', async () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'test',
      email: 'test@example.com',
      roles: ['user', 'admin'] as const
    };
    vi.mocked(userService.lookupUser).mockResolvedValue({
      user: mockUser,
      etag: '"1"'
    });
    vi.mocked(userService.changeUserRoles).mockRejectedValue(
      new Error('No se puede desactivar al último administrador')
    );
    renderDashboard();
    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const searchButton = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
    const checkbox = screen.getByLabelText(/privilegios de administrador/i);
    fireEvent.click(checkbox);
    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);
    const confirmButton = await screen.findByRole('button', {
      name: /confirmar cambios/i
    });
    fireEvent.click(confirmButton);
    const alert = await screen.findByRole('alert');
    const closeButton = within(alert).getByRole('button', {
      name: t('toast.close')
    });
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('disables confirm button while role change mutation is in flight', async () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'test',
      email: 'test@example.com',
      roles: ['user'] as const
    };
    vi.mocked(userService.lookupUser).mockResolvedValue({
      user: mockUser,
      etag: '"1"'
    });
    vi.mocked(userService.changeUserRoles).mockReturnValue(
      new Promise(() => {})
    );
    renderDashboard();
    const input = screen.getByRole('searchbox', { name: /buscar usuario/i });
    const searchButton = screen.getByRole('button', { name: /buscar/i });
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(searchButton);
    await waitFor(() => {
      expect(screen.getByText('test')).toBeInTheDocument();
    });
    const checkbox = screen.getByLabelText(/privilegios de administrador/i);
    fireEvent.click(checkbox);
    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });
    fireEvent.click(saveButton);
    const confirmButton = await screen.findByRole('button', {
      name: /confirmar cambios/i
    });

    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(confirmButton).toBeDisabled();
    });
  });
});
