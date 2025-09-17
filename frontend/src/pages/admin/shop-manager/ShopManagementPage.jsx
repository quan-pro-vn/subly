import { Fragment, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createShop } from '@/api/shops';
import { toast } from 'sonner';
import { Container } from '@/components/common/container';
import PageTitle from '@/components/common/page-title';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/components/layouts/layout-1/components/toolbar';
// Sidebar now hosts filters; no local tabs/dropdown needed
import { ShopManagementContent } from './ShopManagementContent';
import ShopModal from './ShopModal';

export const ShopManagementPage = () => {
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { pathname } = useLocation();
  const initialTab = pathname.endsWith('/expiring') ? 'expiring' : 'notOver1y';
  const [tab, setTab] = useState(initialTab);

  // Keep `tab` in sync with pathname (sidebar submenu routes)
  useEffect(() => {
    const mapPathToTab = () => {
      if (pathname.endsWith('/all')) return 'all';
      if (pathname.endsWith('/valid')) return 'valid';
      if (pathname.endsWith('/expiring')) return 'expiring';
      if (pathname.endsWith('/expired')) return 'expired';
      if (pathname.endsWith('/trashed')) return 'trashed';
      if (pathname.endsWith('/not-over-1y')) return 'notOver1y';
      if (pathname.endsWith('/shop-management')) return 'notOver1y';
      return 'notOver1y';
    };
    setTab(mapPathToTab());
  }, [pathname]);

  const openCreate = () => setCreating(true);
  const closeCreate = () => setCreating(false);

  const handleCreate = async (payload) => {
    try {
      await createShop(payload);
      toast.success('Tạo shop thành công', { richColors: true });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err?.response?.data?.error ?? 'Tạo shop thất bại';
      toast.error(msg, { richColors: true });
      throw err;
    } finally {
      closeCreate();
    }
  };

  return (
    <Fragment>
      <PageTitle title="Shop Management" />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <div className="flex items-center flex-wrap gap-1.5 font-medium" />
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <button
              type="button"
              onClick={openCreate}
              className="btn btn-sm btn-primary"
            >
              Tạo shop
            </button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="mt-0">
          <ShopManagementContent refreshKey={refreshKey} filter={tab} />
        </div>
      </Container>

      <ShopModal
        key={creating ? 'create-open' : 'create-closed'}
        isOpen={creating}
        mode="create"
        onClose={closeCreate}
        onSubmit={handleCreate}
      />
    </Fragment>
  );
};
