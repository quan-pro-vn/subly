import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/layout-18.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';

function Toolbar({ children }) {
  return (
    <div className="pb-5 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
      {children}
    </div>
  );
}

function ToolbarActions({ children }) {
  return <div className="flex items-center gap-2.5">{children}</div>;
}

function ToolbarBreadcrumbs() {
  const { pathname } = useLocation();
  const { getBreadcrumb, isActive } = useMenu(pathname);
  const items = getBreadcrumb(MENU_SIDEBAR);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex [.header_&]:below-lg:hidden items-center gap-1.25 text-xs lg:text-sm font-medium mb-2.5 lg:mb-0">
      <div className="breadcrumb flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const active = item.path ? isActive(item.path) : false;

          return (
            <Fragment key={index}>
              {item.path ? (
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-1',
                    active
                      ? 'text-mono'
                      : 'text-muted-foreground hover:text-primary',
                  )}
                >
                  {item.title}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? 'text-mono' : 'text-muted-foreground')}
                >
                  {item.title}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="size-3.5 muted-foreground" />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function ToolbarHeading({ children }) {
  return <div className="flex flex-col justify-center gap-1">{children}</div>;
}

function ToolbarPageTitle({ children }) {
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);

  return (
    <h1 className="text-base font-medium leading-none text-foreground">
      {children ? children : item?.title || 'Untitled'}
    </h1>
  );
}

function ToolbarDescription({ children }) {
  return (
    <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
      {children}
    </div>
  );
}

export {
  Toolbar,
  ToolbarActions,
  ToolbarBreadcrumbs,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
};
