import type { UserRole } from '../../../types/auth';
import type {
  ChangeUserRolesRequest,
  ManageableRole
} from '../../../types/users';

const isManageableRole = (role: UserRole): role is ManageableRole =>
  role === 'admin' || role === 'collaborator';

export function calculateRolesDelta(
  currentRoles: readonly UserRole[],
  targetRoles: readonly UserRole[]
): ChangeUserRolesRequest {
  const currentSet = new Set(currentRoles);
  const targetSet = new Set(targetRoles);

  const add: ManageableRole[] = targetRoles.filter(
    (role): role is ManageableRole =>
      isManageableRole(role) && !currentSet.has(role)
  );
  const remove: ManageableRole[] = currentRoles.filter(
    (role): role is ManageableRole =>
      isManageableRole(role) && !targetSet.has(role)
  );

  const delta: {
    add?: readonly ManageableRole[];
    remove?: readonly ManageableRole[];
  } = {};
  if (add.length > 0) delta.add = add;
  if (remove.length > 0) delta.remove = remove;

  return delta;
}
