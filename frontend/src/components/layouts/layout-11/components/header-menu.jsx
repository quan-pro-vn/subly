import { Link } from 'react-router';
import { useLocation } from 'react-router-dom';
import { MENU_HEADER } from '@/config/layout-11.config';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';
import { Separator } from '@/components/ui/separator';

export function HeaderMenu() {
  const { pathname } = useLocation();
  const { isActive } = useMenu(pathname);

  return (
    <div className="flex items-stretch">
      <Separator
        orientation="vertical"
        className="h-7 mx-5 my-auto border-red-500"
      />
      <nav className="list-none flex items-stretch gap-7.5">
        {MENU_HEADER.map((item, index) => {
          const active = isActive(item.path);
          return (
            <li key={index} className="flex items-stretch">
              <Link
                to={item.path || '#'}
                className={cn(
                  'inline-flex items-center border-b border-transparent text-sm font-medium text-secondary-foreground hover:text-primary',
                  active && 'text-primary border-primary',
                )}
              >
                {item.title}
              </Link>
            </li>
          );
        })}
      </nav>
    </div>
  );
}
