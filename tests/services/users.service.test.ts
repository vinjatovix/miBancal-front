import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as api from '../../src/services/api';
import { changeUserRoles, lookupUser } from '../../src/services/users.service';
import type { UserRole } from '../../src/types/auth';
import type { ChangeUserRolesRequest } from '../../src/types/users';

vi.mock('../../src/services/api', () => ({
  apiFetchWithMeta: vi.fn()
}));

describe('users.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('performs lookupUser by email', async () => {
    const mockData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'test',
      email: 'test@example.com',
      roles: ['user'] as UserRole[]
    };
    vi.mocked(api.apiFetchWithMeta).mockResolvedValue({
      data: mockData,
      etag: '"1"'
    });

    const result = await lookupUser({ email: 'test@example.com' });

    expect(api.apiFetchWithMeta).toHaveBeenCalledWith(
      '/api/v1/users/lookup?email=test%40example.com'
    );
    expect(result).toEqual({ user: mockData, etag: '"1"' });
  });

  it('performs lookupUser by username', async () => {
    const mockData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'hortelano',
      email: 'hortelano@example.com',
      roles: ['user'] as UserRole[]
    };
    vi.mocked(api.apiFetchWithMeta).mockResolvedValue({
      data: mockData,
      etag: '"1"'
    });

    const result = await lookupUser({ username: 'hortelano' });

    expect(api.apiFetchWithMeta).toHaveBeenCalledWith(
      '/api/v1/users/lookup?username=hortelano'
    );
    expect(result).toEqual({ user: mockData, etag: '"1"' });
  });

  it('throws an error when lookupUser response lacks ETag', async () => {
    const mockData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      username: 'test',
      email: 'test@example.com',
      roles: ['user'] as UserRole[]
    };
    vi.mocked(api.apiFetchWithMeta).mockResolvedValue({
      data: mockData,
      etag: null
    });

    const action = lookupUser({ email: 'test@example.com' });

    await expect(action).rejects.toThrow('ETag missing');
  });

  it('applies admin role delta via changeUserRoles', async () => {
    const mockData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      roles: ['admin', 'user'] as UserRole[],
      metadata: {
        createdAt: '2026-10-18T12:00:00Z',
        createdBy: 'admin',
        updatedAt: '2026-10-18T12:00:00Z',
        updatedBy: 'admin'
      }
    };
    vi.mocked(api.apiFetchWithMeta).mockResolvedValue({
      data: mockData,
      etag: '"2"'
    });
    const delta: ChangeUserRolesRequest = { add: ['admin'] };

    const result = await changeUserRoles(
      '550e8400-e29b-41d4-a716-446655440000',
      delta,
      '"1"'
    );

    expect(api.apiFetchWithMeta).toHaveBeenCalledWith(
      '/api/v1/users/550e8400-e29b-41d4-a716-446655440000/roles',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(delta),
        headers: { 'If-Match': '"1"' }
      })
    );
    expect(result).toEqual({ userRoles: mockData, etag: '"2"' });
  });

  it('applies collaborator role delta via changeUserRoles', async () => {
    const mockData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      roles: ['collaborator', 'user'] as UserRole[],
      metadata: {
        createdAt: '2026-10-18T12:00:00Z',
        createdBy: 'admin',
        updatedAt: '2026-10-18T12:00:00Z',
        updatedBy: 'admin'
      }
    };
    vi.mocked(api.apiFetchWithMeta).mockResolvedValue({
      data: mockData,
      etag: '"2"'
    });
    const delta: ChangeUserRolesRequest = { add: ['collaborator'] };

    const result = await changeUserRoles(
      '550e8400-e29b-41d4-a716-446655440000',
      delta,
      '"1"'
    );

    expect(api.apiFetchWithMeta).toHaveBeenCalledWith(
      '/api/v1/users/550e8400-e29b-41d4-a716-446655440000/roles',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(delta),
        headers: { 'If-Match': '"1"' }
      })
    );
    expect(result).toEqual({ userRoles: mockData, etag: '"2"' });
  });

  it('throws an error when changeUserRoles response lacks ETag', async () => {
    const mockData = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      roles: ['user'] as UserRole[],
      metadata: {
        createdAt: '2026-10-18T12:00:00Z',
        createdBy: 'admin',
        updatedAt: '2026-10-18T12:00:00Z',
        updatedBy: 'admin'
      }
    };
    vi.mocked(api.apiFetchWithMeta).mockResolvedValue({
      data: mockData,
      etag: null
    });
    const delta: ChangeUserRolesRequest = { add: ['admin'] };

    const action = changeUserRoles(
      '550e8400-e29b-41d4-a716-446655440000',
      delta,
      '"1"'
    );

    await expect(action).rejects.toThrow('ETag missing');
  });
});
