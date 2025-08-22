import { cn } from '@/lib/utils';
import { SidebarContent } from './sidebar-content';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';

export function Sidebar() {
  return (
    <aside
      className={cn(
        'flex flex-col fixed z-[10] start-0 top-0 bottom-0 w-(--sidebar-width) in-data-[sidebar-collapsed]:w-(--sidebar-width-collapsed) bg-background lg:bg-transparent',
        '[--sidebar-space-x:calc(var(--spacing)*2.5)]',
        'transition-[width] duration-200 ease-in-out',
      )}
    >
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter />
    </aside>
  );
}
