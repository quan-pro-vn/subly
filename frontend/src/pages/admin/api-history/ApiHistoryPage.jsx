import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import PageTitle from '@/components/common/page-title';
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/components/layouts/layout-1/components/toolbar';
import ApiHistoryContent from './ApiHistoryContent';

export default function ApiHistoryPage() {
  return (
    <Fragment>
      <PageTitle title="API Call History" />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <div className="flex items-center flex-wrap gap-1.5 font-medium" />
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions />
        </Toolbar>
      </Container>

      <Container>
        <div className="mt-0">
          <ApiHistoryContent />
        </div>
      </Container>
    </Fragment>
  );
}

