import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { LoadingState } from '../ui/AsyncState';

/**
 * Wraps routes that require backend-confirmed admin access.
 * Redirects non-admins to home, unauthenticated users to /login.
 */
export function AdminRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [accessCheck, setAccessCheck] = useState<{
    userId: string | null;
    status: 'idle' | 'granted' | 'denied';
  }>({ userId: null, status: 'idle' });

  useEffect(() => {
    if (isLoading || !user || user.role !== 'admin') return;

    let isCurrent = true;

    authApi
      .verifyAdminAccess()
      .then(() => {
        if (isCurrent) setAccessCheck({ userId: user.id, status: 'granted' });
      })
      .catch(() => {
        if (isCurrent) setAccessCheck({ userId: user.id, status: 'denied' });
      });

    return () => {
      isCurrent = false;
    };
  }, [isLoading, user]);

  if (isLoading) {
    return <LoadingState message="Checking permissions…" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const hasCurrentAdminCheck = accessCheck.userId === user.id;

  if (!hasCurrentAdminCheck || accessCheck.status === 'idle') {
    return <LoadingState message="Confirming admin access…" />;
  }

  if (accessCheck.status === 'denied') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
