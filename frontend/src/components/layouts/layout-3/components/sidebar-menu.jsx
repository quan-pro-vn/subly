import {
  BarChart3,
  Bell,
  CheckSquare,
  Code,
  HelpCircle,
  MessageSquare,
  Settings,
  Shield,
  UserCircle,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function SidebarMenu() {
  const items = [
    {
      icon: BarChart3,
      path: '/layout-3',
      title: 'Dashboard',
    },
    {
      icon: UserCircle,
      path: '/layout-3/empty',
      title: 'Profile',
    },
    {
      icon: Settings,
      path: '/layout-3/empty',
      title: 'Account',
    },
    {
      icon: Users,
      path: '/layout-3/empty',
      title: 'Network',
      active: true,
    },
    {
      icon: Shield,
      path: '/layout-3/empty',
      title: 'Plans',
    },
    {
      icon: MessageSquare,
      path: '/layout-3/empty',
      title: 'Security Logs',
    },
    {
      icon: Bell,
      path: '/layout-3/empty',
      title: 'Notifications',
    },
    {
      icon: CheckSquare,
      path: '/layout-3/empty',
      title: 'ACL',
    },
    {
      icon: Code,
      path: '/layout-3/empty',
      title: 'API Keys',
    },
    {
      icon: HelpCircle,
      path: 'https://docs.keenthemes.com/metronic-vite',
      title: 'Docs',
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex flex-col grow items-center py-3.5 lg:py-0 gap-2.5">
        {items.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                shape="circle"
                mode="icon"
                {...(item.active ? { 'data-state': 'open' } : {})}
                className={cn(
                  'data-[state=open]:bg-background data-[state=open]:border data-[state=open]:border-input data-[state=open]:text-primary',
                  'hover:bg-background hover:border hover:border-input hover:text-primary',
                )}
              >
                <Link
                  to={item.path || ''}
                  {...(item.newTab
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  <item.icon className="size-4.5!" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
