import { RequireAuth } from '@/auth/require-auth';
import { Layout1Page } from '@/pages/layout-1/page';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout1 } from '@/components/layouts/layout-1';
import { AuthRouting } from '../auth/auth-routing';
import { RequireRole } from '@/auth/require-role';
import { UserManagementPage } from '../pages/admin/user-manager/UserManagementPage';
import ShopManagementNotOver1yPage from '../pages/admin/shop-manager/pages/ShopManagementNotOver1yPage';
import ShopManagementAllPage from '../pages/admin/shop-manager/pages/ShopManagementAllPage';
import ShopManagementValidPage from '../pages/admin/shop-manager/pages/ShopManagementValidPage';
import ShopManagementExpiringPage from '../pages/admin/shop-manager/pages/ShopManagementExpiringPage';
import ShopManagementExpiredPage from '../pages/admin/shop-manager/pages/ShopManagementExpiredPage';
import ShopTrashPage from '../pages/admin/shop-manager/pages/ShopTrashPage';
import { CustomerManagementPage } from '../pages/admin/customer-manager/CustomerManagementPage';
import ShopDetailPage from '../pages/admin/shop-manager/ShopDetailPage';
import ApiHistoryPage from '../pages/admin/api-history/ApiHistoryPage';
import IntegrationPage from '../pages/admin/integration/IntegrationPage';

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
            <Route path="/shop-management">
              <Route index element={<ShopManagementNotOver1yPage />} />
              <Route path="not-over-1m" element={<ShopManagementNotOver1yPage />} />
              <Route path="all" element={<ShopManagementAllPage />} />
              <Route path="valid" element={<ShopManagementValidPage />} />
              <Route path="expiring" element={<ShopManagementExpiringPage />} />
              <Route path="expired" element={<ShopManagementExpiredPage />} />
              <Route path="trashed" element={<ShopTrashPage />} />
            </Route>
            <Route path="/shops/:id" element={<ShopDetailPage />} />
            <Route path="/customer-management" element={<CustomerManagementPage />} />
            <Route path="/call-history-api" element={<ApiHistoryPage />} />
            <Route path="/integration" element={<IntegrationPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="auth/*" element={<AuthRouting />} />
    </Routes>
  );
}
