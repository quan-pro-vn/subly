import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/auth';

export function RequireRole({ roles = [] }) {
  const location = useLocation();
  const { currentUser } = useAuth();

  // Wait for user to load to avoid false redirects
  if (!currentUser) return null;

  const userRoles = (currentUser.roles || []).map((r) => r.name);
  const allowed = roles.length === 0 || roles.some((r) => userRoles.includes(r));

  if (!allowed) {
    const next = encodeURIComponent(location.pathname + location.search + location.hash);
    return <Navigate to={`/dashboard?error=forbidden&next=${next}`} replace />;
  }

  return <Outlet />;
}
