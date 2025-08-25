import { Layout1Page } from '@/pages/layout-1/page';
import { Route, Routes } from 'react-router';
import { Layout1 } from '@/components/layouts/layout-1';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route element={<Layout1 />}>
        <Route path="/layout-1" element={<Layout1Page />} />
        <Route path="/layout-1/dark-sidebar" element={<Layout1Page />} />
      </Route>
    </Routes>
  );
}
