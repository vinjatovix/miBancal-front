import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserRolesManagement } from '../../../../src/pages/admin/hooks/useUserRolesManagement';
import * as userService from '../../../../src/services/users.service';
import { t } from '../../../../src/i18n/core/t';

vi.mock('../../../../src/services/users.service');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }: { readonly children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserRolesManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches user by email and updates state on success', async () => {
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'hortelano',
      email: 'hortelano@example.com',
      roles: ['user'] as const
    };
    vi.mocked(userService.lookupUser).mockResolvedValue({
      user: mockUser,
      etag: '"etag-1"'
    });
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUserRolesManagement(), { wrapper });

    await act(async () => {
      await result.current.search('hortelano@example.com');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.etag).toBe('"etag-1"');
    expect(result.current.error).toBeNull();
  });

  it('ignores empty search term without invoking lookup', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUserRolesManagement(), { wrapper });

    await act(async () => {
      await result.current.search('   ');
    });

    expect(userService.lookupUser).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets validation error when search term is an invalid email address', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUserRolesManagement(), { wrapper });

    await act(async () => {
      await result.current.search('invalid-email@');
    });

    expect(userService.lookupUser).not.toHaveBeenCalled();
    expect(result.current.error?.message).toBe(t('admin.search_invalid_email'));
    expect(result.current.user).toBeNull();
  });

  it('toggles modal open state via setIsModalOpen', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUserRolesManagement(), { wrapper });

    act(() => {
      result.current.setIsModalOpen(true);
    });

    expect(result.current.isModalOpen).toBe(true);
  });

  it('applies role delta and updates roles on successful mutation', async () => {
    const initialUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'hortelano',
      email: 'hortelano@example.com',
      roles: ['user'] as const
    };
    vi.mocked(userService.lookupUser).mockResolvedValue({
      user: initialUser,
      etag: '"etag-1"'
    });
    vi.mocked(userService.changeUserRoles).mockResolvedValue({
      userRoles: {
        id: initialUser.id,
        roles: ['user', 'admin'],
        metadata: {
          createdAt: '2026-01-01T00:00:00Z',
          createdBy: 'admin',
          updatedAt: '2026-01-01T00:00:00Z',
          updatedBy: 'admin'
        }
      },
      etag: '"etag-2"'
    });
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUserRolesManagement(), { wrapper });
    await act(async () => {
      await result.current.search('hortelano@example.com');
    });
    act(() => {
      result.current.setIsModalOpen(true);
    });

    await act(async () => {
      result.current.saveRoles(['user', 'admin']);
    });

    expect(userService.changeUserRoles).toHaveBeenCalledWith(
      initialUser.id,
      { add: ['admin'] },
      '"etag-1"'
    );
    expect(result.current.user?.roles).toEqual(['user', 'admin']);
    expect(result.current.etag).toBe('"etag-2"');
    expect(result.current.isModalOpen).toBe(false);
  });
});
