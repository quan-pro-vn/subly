import { Link, useLocation } from 'react-router-dom';
import { MENU_MEGA } from '@/config/layout-1.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { MegaMenuSubAccount } from '@/components/layouts/layout-1/shared/mega-menu/mega-menu-sub-account';
import { MegaMenuSubAuth } from '@/components/layouts/layout-1/shared/mega-menu/mega-menu-sub-auth';
import { MegaMenuSubNetwork } from '@/components/layouts/layout-1/shared/mega-menu/mega-menu-sub-network';
import { MegaMenuSubProfiles } from '@/components/layouts/layout-1/shared/mega-menu/mega-menu-sub-profiles';
import { MegaMenuSubStore } from '@/components/layouts/layout-1/shared/mega-menu/mega-menu-sub-store';

export function MegaMenu() {
  const { pathname } = useLocation();
  const { isActive, hasActiveChild } = useMenu(pathname);
  const homeItem = MENU_MEGA[0];
  const publicProfilesItem = MENU_MEGA[1];
  const myAccountItem = MENU_MEGA[2];
  const networkItem = MENU_MEGA[3];
  const authItem = MENU_MEGA[4];
  const storeItem = MENU_MEGA[5];

  const linkClass = `
    text-sm text-secondary-foreground font-medium 
    hover:text-primary hover:bg-transparent 
    focus:text-primary focus:bg-transparent 
    data-[active=true]:text-primary data-[active=true]:bg-transparent 
    data-[state=open]:text-primary data-[state=open]:bg-transparent
  `;

  return (
    <NavigationMenu>
    </NavigationMenu>
  );
}
