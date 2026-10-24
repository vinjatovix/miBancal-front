import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import InsufficientPermissionsPage from '../../pages/auth/InsufficientPermissionsPage';
import { useAuth } from './useAuth';

interface Props {
  readonly children: ReactNode;
}

export function EditorialRoute({ children }: Props) {
  const { isAuthenticated, isEditor, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isEditor) {
    return <InsufficientPermissionsPage />;
  }

  return <>{children}</>;
}
