import { Outlet } from 'react-router';
import { cn } from '@/lib/utils';
import { useLayout } from './layout-context';
import { Sidebar } from './sidebar';

export function Layout() {
  const { sidebarCollapse } = useLayout();

  const rootProps = {
    className: cn(
      'flex grow h-screen flex-col',
      '[--sidebar-width:250px] [--sidebar-width-collapsed:52px]',
    ),
    ...(sidebarCollapse === true && { 'data-sidebar-collapsed': true }),
  };

  return (
    <div {...rootProps}>
      <div className="flex flex-1 bg-zinc-100">
        <Sidebar />
        <main className="rounded-xl bg-background  m-2.5 flex-1 flex flex-col ms-(--sidebar-width) in-data-[sidebar-collapsed]:ms-(--sidebar-width-collapsed) transition-[margin] duration-200 ease-in-out">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
