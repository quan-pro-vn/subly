import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getToken } from './utils/auth';

export function RequireAuth() {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    const next = encodeURIComponent(
      location.pathname + location.search + location.hash,
    );
    return <Navigate to={`/auth/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
