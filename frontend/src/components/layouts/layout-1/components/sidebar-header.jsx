import { Link } from 'react-router-dom';

export function SidebarHeader() {
  const appName = import.meta.env.VITE_APP_NAME || 'Application';

  return (
    <div className="sidebar-header hidden lg:flex items-center relative justify-between px-3 lg:px-6 shrink-0">
      <Link to="/dashboard">
        <div className="flex items-center gap-2">
          <span className="default-logo h-[22px] inline-flex items-center text-lg font-semibold">
            {appName}
          </span>
          <span className="small-logo h-[22px] inline-flex items-center text-lg font-semibold">
            {appName}
          </span>
        </div>
      </Link>
    </div>
  );
}
