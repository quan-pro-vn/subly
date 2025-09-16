import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createShop, listShops } from '@/api/shops';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShopManagementContent } from './ShopManagementContent';
import ShopModal from './ShopModal';

export const ShopManagementPage = () => {
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { pathname } = useLocation();
  const initialTab = pathname.endsWith('/expiring') ? 'expiring' : 'notOver1y';
  const [tab, setTab] = useState(initialTab);
  const [allShops, setAllShops] = useState([]);
  const [loadingCount, setLoadingCount] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoadingCount(true);
        const data = await listShops();
        setAllShops(Array.isArray(data) ? data : []);
      } finally {
        setLoadingCount(false);
      }
    };
    run();
  }, [refreshKey]);

  const counts = useMemo(() => {
    const dayMs = 1000 * 60 * 60 * 24;
    const now = new Date();
    const expiringThresholdDays = 30;
    let all = 0,
      valid = 0,
      expired = 0,
      notOver1y = 0,
      expiring = 0;
    (allShops || []).forEach((it) => {
      all += 1;
      const exp = it.expired_at ? new Date(it.expired_at) : null;
      const isValid = !exp || exp.getTime() - now.getTime() >= 0;
      if (isValid) {
        valid += 1;
        notOver1y += 1; // valid always included in not-over-1y
        if (exp) {
          const days = (exp.getTime() - now.getTime()) / dayMs;
          if (days >= 0 && days <= expiringThresholdDays) expiring += 1;
        }
      } else {
        expired += 1;
        if (exp) {
          const overDays = (now.getTime() - exp.getTime()) / dayMs;
          if (overDays <= 365) notOver1y += 1;
        }
      }
    });
    return { all, valid, expired, notOver1y, expiring };
  }, [allShops]);

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
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList variant="line" className="w-full mb-4">
            <TabsTrigger value="notOver1y">
              Không quá 1 năm
              <span className="ml-2 badge">{counts.notOver1y}</span>
            </TabsTrigger>
            <TabsTrigger value="all">
              Tất cả
              <span className="ml-2 badge">{counts.all}</span>
            </TabsTrigger>
            <TabsTrigger value="expiring">
              Sắp hết hạn
              <span className="ml-2 badge badge-warning">{counts.expiring}</span>
            </TabsTrigger>
            <TabsTrigger value="valid">
              Còn hạn
              <span className="ml-2 badge badge-success">{counts.valid}</span>
            </TabsTrigger>
            <TabsTrigger value="expired">
              Hết hạn
              <span className="ml-2 badge badge-danger">{counts.expired}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notOver1y" className="mt-0">
            <ShopManagementContent refreshKey={refreshKey} filter="notOver1y" />
          </TabsContent>
          <TabsContent value="all" className="mt-0">
            <ShopManagementContent refreshKey={refreshKey} filter="all" />
          </TabsContent>
          <TabsContent value="valid" className="mt-0">
            <ShopManagementContent refreshKey={refreshKey} filter="valid" />
          </TabsContent>
          <TabsContent value="expiring" className="mt-0">
            <ShopManagementContent refreshKey={refreshKey} filter="expiring" />
          </TabsContent>
          <TabsContent value="expired" className="mt-0">
            <ShopManagementContent refreshKey={refreshKey} filter="expired" />
          </TabsContent>
        </Tabs>
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
