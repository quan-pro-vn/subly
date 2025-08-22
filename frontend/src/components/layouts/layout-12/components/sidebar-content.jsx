import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SidebarCommunities } from './sidebar-communities';
import { SidebarFeeds } from './sidebar-feeds';
import { SidebarPrimaryMenu } from './sidebar-primary-menu';
import { SidebarResourcesMenu } from './sidebar-resources-menu';

export function SidebarContent() {
  return (
    <ScrollArea className="grow h-[calc(100vh-5.5rem)] lg:h-[calc(100vh-4rem)] mt-0 mb-2.5 lg:my-7.5">
      <SidebarPrimaryMenu />
      <Separator className="my-2.5" />
      <SidebarFeeds />
      <Separator className="my-2.5" />
      <SidebarCommunities />
      <Separator className="my-2.5" />
      <SidebarResourcesMenu />
      <Separator className="my-2.5" />
    </ScrollArea>
  );
}
