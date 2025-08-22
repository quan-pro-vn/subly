import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLayout } from './context';
import { Header } from './header';
import { Sidebar } from './sidebar';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from './toolbar';

export function Wrapper() {
  const { isMobile } = useLayout();

  return (
    <>
      <Header />

      <div className="flex flex-col lg:flex-row grow pt-(--header-height)">
        <div className="flex grow rounded-xl bg-background border border-input m-2.5 mt-0">
          {!isMobile && <Sidebar />}
          <div className="grow overflow-y-auto p-5">
            <main className="grow" role="content">
              <Toolbar>
                <ToolbarHeading>
                  <ToolbarPageTitle>Team Settings</ToolbarPageTitle>
                  <ToolbarDescription>
                    Some info tells the story
                  </ToolbarDescription>
                </ToolbarHeading>
                <ToolbarActions>
                  <Button variant="outline">Setup Rules</Button>
                </ToolbarActions>
              </Toolbar>
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
