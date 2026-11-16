import { describe, it, expect } from 'vitest';
import { calculateRolesDelta } from '../../../../src/pages/admin/utils/calculateRolesDelta';
import type { UserRole } from '../../../../src/types/auth';
import type { ChangeUserRolesRequest } from '../../../../src/types/users';

describe('calculateRolesDelta', () => {
  it.each<{
    current: readonly UserRole[];
    target: readonly UserRole[];
    expected: ChangeUserRolesRequest;
  }>([
    {
      current: ['user'],
      target: ['user', 'admin'],
      expected: { add: ['admin'] }
    },
    {
      current: ['user', 'admin'],
      target: ['user'],
      expected: { remove: ['admin'] }
    },
    {
      current: ['user'],
      target: ['user', 'collaborator'],
      expected: { add: ['collaborator'] }
    },
    {
      current: ['user', 'collaborator'],
      target: ['user'],
      expected: { remove: ['collaborator'] }
    },
    {
      current: ['user'],
      target: ['user', 'admin', 'collaborator'],
      expected: { add: ['admin', 'collaborator'] }
    },
    {
      current: ['user', 'collaborator'],
      target: ['user', 'admin'],
      expected: { add: ['admin'], remove: ['collaborator'] }
    },
    {
      current: ['user'],
      target: ['user'],
      expected: {}
    },
    {
      current: ['user', 'admin', 'collaborator'],
      target: ['user', 'admin', 'collaborator'],
      expected: {}
    }
  ])(
    'calculates delta from $current to $target',
    ({ current, target, expected }) => {
      const delta = calculateRolesDelta(current, target);

      expect(delta).toEqual(expected);
    }
  );
});
