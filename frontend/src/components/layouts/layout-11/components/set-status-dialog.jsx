import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Flag,
  Plus,
  Thermometer,
  X,
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function SetStatusDialog({ trigger, open, onOpenChange }) {
  const [statusText, setStatusText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);

  const statusOptions = [
    {
      id: 'meeting',
      title: 'In a meeting',
      icon: <Calendar className="size-4" />,
      duration: 'for an hour',
      variant: 'default',
    },
    {
      id: 'focusing',
      title: 'Focusing',
      icon: <BookOpen className="size-4" />,
      duration: 'for 4 hours',
      variant: 'secondary',
    },
    {
      id: 'sick',
      title: 'Sick',
      icon: <Thermometer className="size-4" />,
      duration: 'OOO for Today',
      variant: 'destructive',
    },
    {
      id: 'vacation',
      title: 'Vacation',
      icon: <Flag className="size-4" />,
      duration: 'OOO until Wednesday',
      variant: 'outline',
    },
  ];

  const handleSave = () => {
    // Handle status save logic here
    console.log('Status saved:', { statusText, selectedStatus });
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            Set status
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onOpenChange?.(false)}
          >
            <X className="size-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Input */}
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarImage
                src={toAbsoluteUrl('/media/avatars/300-2.png')}
                alt="Sean"
              />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <Input
              placeholder="What's on your mind?"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              className="flex-1"
            />

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="size-4" />
            </Button>
          </div>

          {/* Predefined Status Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">
              For Sean's Workspace
            </h3>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedStatus === option.id ? 'default' : 'ghost'}
                  className="w-full justify-start h-auto p-3"
                  onClick={() => setSelectedStatus(option.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span className="font-medium">{option.title}</span>
                    </div>
                    <Badge variant={option.variant} className="ml-auto text-xs">
                      {option.duration}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} className="gap-2">
              Save
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
