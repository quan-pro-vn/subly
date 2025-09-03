import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/components/layouts/layout-1/components/toolbar';

import { UserManagementContent } from './UserManagementContent';
import { createUser } from '@/api/users';
import UserModal from './UserModal';

export const UserManagementPage = () => {
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openCreate = () => setCreating(true);
  const closeCreate = () => setCreating(false);

  const handleCreate = async (payload) => {
    try {
      await createUser(payload);
      toast.success('Tạo nhân viên thành công', { richColors: true });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err?.response?.data?.error ?? 'Tạo nhân viên thất bại';
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
            <button type="button" onClick={openCreate} className="btn btn-sm btn-primary">
              Tạo nhân viên
            </button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <UserManagementContent refreshKey={refreshKey} />
      </Container>

      <UserModal
        key={creating ? 'create-open' : 'create-closed'}
        isOpen={creating}
        mode="create"
        onClose={closeCreate}
        onSubmit={handleCreate}
      />
    </Fragment>
  );
};
