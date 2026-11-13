import { useContext } from 'react';
import { AuthContext } from '../auth/authContextDef';
import type { PlantRoleScope } from './plantKeys';

export function usePlantRoleScope(): PlantRoleScope {
  const auth = useContext(AuthContext);
  return auth?.isAdmin ? 'admin' : 'public';
}
