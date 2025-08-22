import { Outlet } from 'react-router-dom';
import { useLayout } from './context';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Toolbar } from './toolbar';

export function Wrapper() {
  const { isMobile } = useLayout();

  return (
    <>
      <Header />

      <div className="flex grow pt-(--header-height-mobile) lg:pt-(--header-height)">
        {!isMobile && <Sidebar />}

        <div className="flex flex-col grow lg:ps-(--sidebar-width) lg:[&_.container-fluid]:px-7.5">
          <Toolbar />
          <main className="grow pb-4 lg:pb-7.5" role="content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}
