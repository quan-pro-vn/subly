import { ChevronsUpDown, Zap } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function SidebarHeader() {
  return (
    <div className="flex items-center justify-between w-full px-5 h-(--sidebar-header-height) border-b border-border shrink-0">
      <Link to="/layout-13" className="flex items-center gap-2">
        <Button
          size="sm"
          mode="icon"
          className="bg-[#00998F] hover:bg-teal-600/90"
        >
          <Zap className="text-white" />
        </Button>
        <span className="text-mono text-sm font-medium hidden lg:block">
          Thunder Team
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            mode="icon"
            variant="ghost"
            className="hidden lg:inline-flex text-muted-foreground hover:text-foreground"
          >
            <ChevronsUpDown className="opacity-100" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end" sideOffset={13}>
          <DropdownMenuCheckboxItem>Task List</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Calendar</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>Notifications</DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem>
            Analytics Overview
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
