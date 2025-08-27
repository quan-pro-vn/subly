import { Navigate, Outlet, useLocation } from 'react-router-dom';

function getToken() {
  return (
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('auth_token') ||
    null
  );
}

export function RequireAuth() {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    const next = encodeURIComponent(
      location.pathname + location.search + location.hash
    );
    return <Navigate to={`/auth/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
