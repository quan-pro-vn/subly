import { Fragment } from 'react';

import { Container } from '../../../components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/components/layouts/layout-1/components/toolbar';

// import { UserManagerContent } from '.';
import { useNavigate } from 'react-router-dom';

const UserManagementPage = () => {
  const navigate = useNavigate();
//   const [totalUsers, setTotalUsers] = useState(0);

  const redirectToCreate = () => {
    navigate('/admin/users/create-basic');
  };

//   const getTotalUsers = (total: number) => {
//     setTotalUsers(total);
//   };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <div className="flex items-center flex-wrap gap-1.5 font-medium">
                <span className="text-md text-gray-700">Tổng số nhân viên:</span>
                {/* <span className="text-md text-gray-800 font-medium me-2">{totalUsers}</span> */}
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
        {/* <UserManagerContent onData={getTotalUsers} /> */}
      </Container>
    </Fragment>
  );
};

export { UserManagementPage };
