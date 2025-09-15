import { CustomerManagementContent } from './CustomerManagementContent';
import { useState } from 'react';

export const CustomerManagementPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="card-container">
        <div className="card-content flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">Quản lý khách hàng</div>
            <div className="text-sm text-muted-foreground">
              Danh sách khách hàng đã import
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={refresh}>
              Tải lại
            </button>
          </div>
        </div>
      </div>

      <CustomerManagementContent refreshKey={refreshKey} />
    </div>
  );
};

