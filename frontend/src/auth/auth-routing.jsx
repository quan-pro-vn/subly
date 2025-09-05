import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { authRoutes } from './auth-routes';
import { getToken } from './utils/auth';

export function AuthRouting() {
  const location = useLocation();
  const token = getToken();

  if (token) {
    const next = new URLSearchParams(location.search).get('next');
    const safeNext =
      next && !next.startsWith('/auth')
        ? decodeURIComponent(next)
        : '/dashboard';
    return <Navigate to={safeNext} replace />;
  }

  return (
    <Routes>
      <Route index element={<Navigate to="login" replace />} />

      {authRoutes.map((route) => {
        const basePath = route.path?.replace('auth/', '') || '';
        return (
          <Route
            key={basePath || 'root'}
            path={basePath}
            element={route.element}
          >
            {route.children?.map((child) => (
              <Route
                key={child.path}
                path={child.path}
                element={child.element}
              />
            ))}
          </Route>
        );
      })}
    </Routes>
  );
}
