import type { AuthUser, UserRole } from '../../types/auth';

const CATALOG_EDITOR_ROLES: readonly UserRole[] = ['admin', 'collaborator'];

export function hasCatalogEditorRole(
  userOrRoles: AuthUser | readonly UserRole[] | null | undefined
): boolean {
  if (!userOrRoles) {
    return false;
  }
  const roles = Array.isArray(userOrRoles)
    ? userOrRoles
    : 'roles' in userOrRoles
      ? userOrRoles.roles
      : [];
  return roles.some((role) => CATALOG_EDITOR_ROLES.includes(role));
}
