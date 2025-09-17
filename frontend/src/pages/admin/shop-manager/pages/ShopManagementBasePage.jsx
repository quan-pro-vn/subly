import { Fragment, useState } from 'react';
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
import { ShopManagementContent } from '../ShopManagementContent';
import ShopModal from '../ShopModal';

export default function ShopManagementBasePage({ filter = 'notOver1y', title = 'Quản lý Shop' }) {
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
      <PageTitle title={title} />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <div className="flex items-center flex-wrap gap-1.5 font-medium" />
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <button type="button" onClick={openCreate} className="btn btn-sm btn-primary">
              Tạo shop
            </button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="mt-0">
          <ShopManagementContent refreshKey={refreshKey} filter={filter} />
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
}
