import { useContext } from 'react';
import { AuthContext } from '../auth/authContextDef';
import type { GardenInputRoleScope } from './gardenInputKeys';

export function useGardenInputRoleScope(): GardenInputRoleScope {
  const auth = useContext(AuthContext);
  return auth?.isEditor ? 'editorial' : 'public';
}
