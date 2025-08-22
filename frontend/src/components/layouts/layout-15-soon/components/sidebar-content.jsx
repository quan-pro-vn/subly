import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarCreate } from './sidebar-create';
import { SidebarLinks } from './sidebar-links';
import { SidebarNav } from './sidebar-nav';

export function SidebarContent() {
  return (
    <div className="grow">
      <ScrollArea className="h-[calc(100vh-(var(--header-height))-(var(--content-header-height))-(var(--sidebar-footer-height)))] in-data-[sidebar-collapsed]:h-[calc(100vh-(var(--header-height))-(var(--content-header-height))-(var(--sidebar-footer-collapsed-height)))]">
        <div className="py-3.5 space-y-3.5">
          <SidebarCreate />
          <SidebarNav />
          <SidebarLinks />
        </div>
      </ScrollArea>
    </div>
  );
}
