import { useContext } from 'react';
import { AuthContext } from '../auth/authContextDef';
import type { AnomalyRoleScope } from './anomalyKeys';

export function useAnomalyRoleScope(): AnomalyRoleScope {
  const auth = useContext(AuthContext);
  return auth?.isEditor ? 'editorial' : 'public';
}
