import { CustomerManagementContent } from './CustomerManagementContent';
import { useState, Fragment } from 'react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/components/layouts/layout-1/components/toolbar';

export const CustomerManagementPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

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
            <button className="btn btn-sm btn-outline" onClick={refresh}>
              Tải lại
            </button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <CustomerManagementContent refreshKey={refreshKey} />
      </Container>
    </Fragment>
  );
};
