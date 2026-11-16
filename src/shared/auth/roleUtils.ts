import type { AuthUser, UserRole } from '../../types/auth';

const CATALOG_EDITOR_ROLES: ReadonlySet<UserRole> = new Set([
  'admin',
  'collaborator'
]);

function extractRoles(
  userOrRoles: AuthUser | readonly UserRole[]
): readonly UserRole[] {
  if (Array.isArray(userOrRoles)) {
    return userOrRoles;
  }
  if ('roles' in userOrRoles) {
    return userOrRoles.roles;
  }
  return [];
}

export function hasCatalogEditorRole(
  userOrRoles: AuthUser | readonly UserRole[] | null | undefined
): boolean {
  if (!userOrRoles) {
    return false;
  }
  const roles = extractRoles(userOrRoles);
  return roles.some((role) => CATALOG_EDITOR_ROLES.has(role));
}
