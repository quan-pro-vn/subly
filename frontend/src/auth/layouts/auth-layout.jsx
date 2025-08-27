import { Outlet } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

export function AuthLayout() {
  return (
    <>
      <div className="flex flex-col items-center justify-center grow bg-center bg-no-repeat page-bg">
        <Card className="w-full max-w-[400px]">
          <CardContent className="p-6">
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </>
  );
}