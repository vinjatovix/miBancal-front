import type {
  UserLookupView,
  UserRolesView,
  ChangeUserRolesRequest
} from '../../../src/types/users';

export const buildUserLookupView = (
  overrides?: Partial<UserLookupView>
): UserLookupView => ({
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  username: 'testuser',
  email: 'testuser@example.com',
  roles: ['user'],
  ...overrides
});

export const buildUserRolesView = (
  overrides?: Partial<UserRolesView>
): UserRolesView => ({
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  roles: ['user'],
  metadata: {
    createdAt: '2026-01-01T00:00:00Z',
    createdBy: 'system',
    updatedAt: '2026-01-01T00:00:00Z',
    updatedBy: 'system'
  },
  ...overrides
});

export const buildChangeUserRolesRequest = (
  overrides?: ChangeUserRolesRequest
): ChangeUserRolesRequest => ({
  ...overrides
});
