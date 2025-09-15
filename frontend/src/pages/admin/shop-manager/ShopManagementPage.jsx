import { Fragment, useState } from 'react';
import { createShop } from '@/api/shops';
import { toast } from 'sonner';
import { Container } from '@/components/common/container';
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
  const [tab, setTab] = useState('all');

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
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="valid">Còn hạn</TabsTrigger>
            <TabsTrigger value="expired">Hết hạn</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <ShopManagementContent refreshKey={refreshKey} filter="all" />
          </TabsContent>
          <TabsContent value="valid" className="mt-0">
            <ShopManagementContent refreshKey={refreshKey} filter="valid" />
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
