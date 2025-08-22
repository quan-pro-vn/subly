import { useState } from 'react';
import { addDays, format } from 'date-fns';
import { CalendarDays, Download } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router';
import { useBodyClass } from '@/hooks/use-body-class';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Footer } from './footer';
import { Header } from './header';
import { Navbar } from './navbar';
import { Toolbar, ToolbarActions, ToolbarHeading } from './toolbar';

export function Main() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  const [date, setDate] = useState({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });

  useBodyClass(`
    [--header-height:70px]
    bg-background!
  `);

  return (
    <div className="flex grow flex-col pt-(--header-height)">
      <Header />

      {!isMobile && <Navbar />}

      <main className="flex flex-col grow" role="content">
        {!pathname.includes('/layout-9/empty') && (
          <Toolbar>
            <ToolbarHeading />

            <ToolbarActions>
              <Button variant="outline" asChild>
                <Link to={'/layout-9/empty'}>
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
            </ToolbarActions>
          </Toolbar>
        )}

        <Outlet />

        <Footer />
      </main>
    </div>
  );
}
