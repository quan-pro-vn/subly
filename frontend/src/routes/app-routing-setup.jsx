import { RequireAuth } from '@/auth/require-auth';
import { Layout1Page } from '@/pages/layout-1/page';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout1 } from '@/components/layouts/layout-1';
import { AuthRouting } from '../auth/auth-routing';
import { UserManagementPage } from '../pages/admin/user-manager/UserManagementPage';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/layout-1" replace />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout1 />}>
          <Route path="/layout-1" element={<Layout1Page />} />
          <Route path="/layout-1/dark-sidebar" element={<Layout1Page />} />
          <Route path="user-management" element={<UserManagementPage />} />
        </Route>
      </Route>
      <Route path="auth/*" element={<AuthRouting />} />
    </Routes>
  );
}
