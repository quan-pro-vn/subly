import { Outlet } from 'react-router-dom';
import { useLayout } from './context';
import { Header } from './header';
import { HeaderTitle } from './header-title';
import { Sidebar } from './sidebar';

export function Wrapper() {
  const { isMobile } = useLayout();

  return (
    <div className="flex h-screen w-full [&_.container-fluid]:px-6">
      {!isMobile && <Sidebar />}

      <div className="flex flex-col flex-1 min-w-0 w-full">
        <Header />
        <main
          className="flex-1 groww-full lg:ps-(--sidebar-width) pt-(--header-height-mobile) lg:pt-(--header-height)"
          role="content"
        >
          {isMobile && <HeaderTitle />}

          <Outlet />
        </main>
      </div>
    </div>
  );
}
