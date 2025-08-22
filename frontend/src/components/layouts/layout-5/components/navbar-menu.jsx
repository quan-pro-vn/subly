import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function NavbarMenu() {
  const { pathname } = useLocation();

  const items = useMemo(
    () => [
      {
        title: 'Dashboards',
        path: '/layout-5',
        partial: '#',
      },
      {
        title: 'Public Profiles',
        path: '#',
        partial: '#/empty',
      },
      {
        title: 'Account Settings',
        path: '#',
        partial: '#',
      },
      {
        title: 'Network',
        path: '#',
        partial: '#',
      },
      {
        title: 'Store - Client',
        path: '#',
        partial: '#',
      },
      {
        title: 'Authentication',
        path: '#',
        partial: '#',
      },
    ],

    [], // Empty dependency array since the data is static
  );

  const [selectedItem, setSelectedItem] = useState(items[0]);

  useEffect(() => {
    items.forEach((item) => {
      if (item.partial !== '' && pathname.startsWith(item.partial)) {
        setSelectedItem(item);
      }
    });
  }, [items, pathname]);

  return (
    <div className="grid">
      <div className="overflow-x-auto">
        <div className="flex items-stretch h-12 gap-5 lg:gap-7.5">
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={cn(
                'flex items-center text-nowrap font-medium text-sm text-secondary-foreground',
                item.path === selectedItem.path &&
                  'border-b border-primary text-primary',
              )}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
