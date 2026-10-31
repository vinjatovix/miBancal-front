import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../shared/auth/useAuth';

interface ProtectedRouteProps {
  readonly children: ReactNode;
  readonly requireAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAdmin = false
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
