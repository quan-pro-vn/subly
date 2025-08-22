import { Rows3, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, InputWrapper } from '@/components/ui/input';

export function SidebarSearch() {
  const handleInputChange = () => {};

  return (
    <div className="p-4 border-b border-border shrink-0 flex items-center justify-between gap-2.5">
      <InputWrapper>
        <Search />
        <Input
          type="search"
          placeholder="Search Billing"
          onChange={handleInputChange}
        />
      </InputWrapper>

      <Button variant="outline" mode="icon">
        <Rows3 />
      </Button>
    </div>
  );
}
