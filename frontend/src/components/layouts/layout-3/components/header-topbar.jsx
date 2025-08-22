import {
  LayoutGrid,
  MessageCircleMore,
  MessageSquareDot,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { SearchDialog } from '../../layout-1/shared/dialogs/search/search-dialog';
import { AppsDropdownMenu } from '../../layout-1/shared/topbar/apps-dropdown-menu';
import { ChatSheet } from '../../layout-1/shared/topbar/chat-sheet';
import { NotificationsSheet } from '../../layout-1/shared/topbar/notifications-sheet';
import { UserDropdownMenu } from '../../layout-1/shared/topbar/user-dropdown-menu';

export function HeaderTopbar() {
  return (
    <div className="flex items-center gap-2 lg:gap-3.5">
      <Button asChild className="hidden md:inline-flex">
        <Link to="/layout-3/empty">Get Started</Link>
      </Button>
      <SearchDialog
        trigger={
          <Button
            variant="ghost"
            mode="icon"
            shape="circle"
            className="hover:[&_svg]:text-primary"
          >
            <Search className="size-4.5!" />
          </Button>
        }
      />

      <ChatSheet
        trigger={
          <Button
            variant="ghost"
            mode="icon"
            shape="circle"
            className="hover:[&_svg]:text-primary"
          >
            <MessageCircleMore className="size-4.5!" />
          </Button>
        }
      />

      <AppsDropdownMenu
        trigger={
          <Button
            variant="ghost"
            mode="icon"
            shape="circle"
            className="hover:[&_svg]:text-primary"
          >
            <LayoutGrid className="size-4.5!" />
          </Button>
        }
      />

      <NotificationsSheet
        trigger={
          <Button
            variant="ghost"
            mode="icon"
            shape="circle"
            className="hover:[&_svg]:text-primary"
          >
            <MessageSquareDot className="size-4.5!" />
          </Button>
        }
      />

      <UserDropdownMenu
        trigger={
          <img
            className="size-9 rounded-full border-2 border-input shrink-0 cursor-pointer"
            src={toAbsoluteUrl('/media/avatars/gray/5.png')}
            alt="User Avatar"
          />
        }
      />
    </div>
  );
}
