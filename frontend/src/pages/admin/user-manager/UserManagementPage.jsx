import { Fragment } from 'react';

import { Container } from '../../../components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/components/layouts/layout-1/components/toolbar';

import { useNavigate } from 'react-router-dom';
import { UserManagementContent } from './UserManagementContent';

const UserManagementPage = () => {
  const navigate = useNavigate();

  const redirectToCreate = () => {
    navigate('/admin/users/create-basic');
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <div className="flex items-center flex-wrap gap-1.5 font-medium">
              </div>
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <button type="button" onClick={redirectToCreate} className="btn btn-sm btn-primary">
              Tạo nhân viên
            </button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <UserManagementContent />
      </Container>
    </Fragment>
  );
};

export { UserManagementPage };
