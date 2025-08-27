import { Navigate, Route, Routes } from 'react-router-dom';
import { authRoutes } from './auth-routes';

export function AuthRouting() {
  return (
    <Routes>
      <Route index element={<Navigate to="login" replace />} />

      {authRoutes.map((route) => {
        const basePath = route.path?.replace('auth/', '') || '';
        return (
          <Route key={basePath || 'root'} path={basePath} element={route.element}>
            {route.children?.map((child) => (
              <Route key={child.path} path={child.path} element={child.element} />
            ))}
          </Route>
        );
      })}
    </Routes>
  );
}
