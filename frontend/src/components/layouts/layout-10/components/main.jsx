import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { CalendarDays, Download } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useBodyClass } from '@/hooks/use-body-class';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { StoreClientTopbar } from '@/components/layouts/layout-1/shared/topbar/topbar';
import { Footer } from './footer';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { Toolbar, ToolbarActions, ToolbarHeading } from './toolbar';

export function Main() {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const [date, setDate] = useState({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });

  useBodyClass(`
    [--header-height:60px]
    [--sidebar-width:270px]
    bg-zinc-950 dark:bg-background!
  `);

  return (
    <div className="flex grow">
      {isMobile && <Header />}

      <div className="flex flex-col lg:flex-row grow pt-(--header-height) lg:pt-0">
        {!isMobile && <Sidebar />}

        <div className="flex flex-col grow lg:rounded-s-xl bg-background border border-input lg:ms-(--sidebar-width)">
          <div className="flex flex-col grow kt-scrollable-y-auto lg:[scrollbar-width:auto] pt-5">
            <main className="grow" role="content">
              {!pathname.includes('/layout-10/empty') && (
                <Toolbar>
                  <ToolbarHeading />

                  <ToolbarActions>
                    {pathname.startsWith('/store-client') ? (
                      <StoreClientTopbar />
                    ) : (
                      <>
                        <Button variant="outline" asChild>
                          <Link to={'/layout-10/empty'}>
                            <Download />
                            Export
                          </Link>
                        </Button>

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button id="date" variant="outline">
                              <CalendarDays />
                              {date?.from ? (
                                date.to ? (
                                  <span>
                                    {format(date.from, 'LLL dd, y')} -{' '}
                                    {format(date.to, 'LLL dd, y')}
                                  </span>
                                ) : (
                                  format(date.from, 'LLL dd, y')
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                              mode="range"
                              defaultMonth={date?.from}
                              selected={date}
                              onSelect={setDate}
                              numberOfMonths={2}
                            />
                          </PopoverContent>
                        </Popover>
                      </>
                    )}
                  </ToolbarActions>
                </Toolbar>
              )}

              <Outlet />
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
