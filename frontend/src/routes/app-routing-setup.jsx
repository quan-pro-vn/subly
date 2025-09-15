import { RequireAuth } from '@/auth/require-auth';
import { Layout1Page } from '@/pages/layout-1/page';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout1 } from '@/components/layouts/layout-1';
import { AuthRouting } from '../auth/auth-routing';
import { RequireRole } from '@/auth/require-role';
import { UserManagementPage } from '../pages/admin/user-manager/UserManagementPage';
import { ShopManagementPage } from '../pages/admin/shop-manager/ShopManagementPage';
import { CustomerManagementPage } from '../pages/admin/customer-manager/CustomerManagementPage';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout1 />}>
          <Route path="/dashboard" element={<Layout1Page />} />
          <Route path="/dashboard/dark-sidebar" element={<Layout1Page />} />
          <Route element={<RequireRole roles={["admin"]} />}>
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="/shop-management" element={<ShopManagementPage />} />
            <Route path="/customer-management" element={<CustomerManagementPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="auth/*" element={<AuthRouting />} />
    </Routes>
  );
}
