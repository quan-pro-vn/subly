import { ChevronsLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLayout } from './layout-context';

export function SidebarHeader() {
  const { sidebarCollapse, setSidebarCollapse } = useLayout();

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-1.5">
        <div className="size-7 flex items-center justify-center rounded-full bg-primary">
          <svg className="size-5 fill-background" viewBox="0 0 480 480">
            <path d="M211.5 154.6a30 30 0 0 0 57 0l15.5-46.7a46.4 46.4 0 1 0-88 0l15.5 46.7ZM268.5 325.4a30 30 0 0 0-57 0L196 372.1a46.4 46.4 0 1 0 88 0l-15.5-46.7ZM372.1 196l-46.7 15.5a30 30 0 0 0 0 57l46.7 15.5c29.8 10 60.9-12 61.1-43.3v-1.3a46.4 46.4 0 0 0-61-43.4ZM107.9 284l46.7-15.5a30 30 0 0 0 0-57L107.9 196a46.4 46.4 0 1 0 0 88.1ZM320.5 199.7l44-22a46.4 46.4 0 0 0 12.6-73.9l-.9-.9a46.4 46.4 0 0 0-74 12.5l-22 44a30 30 0 0 0 40.3 40.3ZM159.5 280.3l-44 22a46.4 46.4 0 0 0-12.5 74l.8.8a46.4 46.4 0 0 0 74-12.6l22-44a30 30 0 0 0-40.3-40.2ZM364.6 302.3l-44-22a30 30 0 0 0-40.3 40.2l22 44a46.4 46.4 0 0 0 73.9 12.6l.8-.9a46.4 46.4 0 0 0-12.4-74ZM115.4 177.7l44 22a30 30 0 0 0 40.3-40.2l-22-44a46.4 46.4 0 1 0-62.2 62.2Z" />
          </svg>
        </div>
        <span className="flex items-center text-sm">
          <span className="font-semibold ">Metronic</span>
          <span className="text-secondary-foreground">AI</span>
        </span>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="size-6 rounded-full hover:bg-background hover:[&_svg]:opacity-100!"
        onClick={() => setSidebarCollapse(!sidebarCollapse)}
      >
        <ChevronsLeft className="size-3.5 in-data-[sidebar-collapsed]:rotate-180" />
      </Button>
    </div>
  );
}
