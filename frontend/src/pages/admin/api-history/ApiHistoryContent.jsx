import { useEffect, useState } from 'react';
import { listAllApiLogs } from '@/api/shops';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 50;

export default function ApiHistoryContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listAllApiLogs({ page, limit: PAGE_SIZE });
      if (data && Array.isArray(data.items)) {
        setItems(data.items);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      } else if (Array.isArray(data)) {
        setItems(data);
        setTotal(data.length);
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Không thể tải lịch sử gọi API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);

  const goToPage = (p) => { if (p < 1 || p > totalPages) return; setPage(p); };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Lịch sử gọi API</h3>
      </div>
      <div className="card-body p-0 overflow-x-auto">
        {error && (
          <div className="p-4 text-red-600 text-sm">{error}</div>
        )}
        <table className="table table-auto w-full">
          <thead>
            <tr>
              <th className="text-start px-4 py-3">ID</th>
              <th className="text-start px-4 py-3">Shop ID</th>
              <th className="text-start px-4 py-3">Shop UUID</th>
              <th className="text-start px-4 py-3">Domain param</th>
              <th className="text-start px-4 py-3">UUID param</th>
              <th className="text-start px-4 py-3">Status</th>
              <th className="text-start px-4 py-3">Client IP</th>
              <th className="text-start px-4 py-3">User-Agent</th>
              <th className="text-start px-4 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <td key={j} className="px-4 py-2"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-6 text-center text-sm text-muted-foreground">Không có dữ liệu</td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="px-4 py-2 text-sm">{it.id}</td>
                  <td className="px-4 py-2 text-sm">{it.shop_id}</td>
                  <td className="px-4 py-2 text-sm whitespace-nowrap">{it.shop_uuid}</td>
                  <td className="px-4 py-2 text-sm">{it.domain_param || ''}</td>
                  <td className="px-4 py-2 text-sm">{it.uuid_param || ''}</td>
                  <td className="px-4 py-2">
                    <span className={`badge ${it.status === 'valid' ? 'badge-success' : it.status === 'expired' ? 'badge-danger' : 'badge-secondary'}`}>{it.status}</span>
                  </td>
                  <td className="px-4 py-2 text-sm">{it.client_ip}</td>
                  <td className="px-4 py-2 text-sm max-w-[280px] truncate" title={it.user_agent}>{it.user_agent}</td>
                  <td className="px-4 py-2 text-sm whitespace-nowrap">{formatDateTime(it.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {total > 0 ? `Hiển thị ${startIndex + 1}–${endIndex} trong ${total} lượt` : 'Không có dữ liệu'}
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <button className="btn btn-sm" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>Trước</button>
            </PaginationItem>
            {(() => {
              const items = [];
              const maxButtons = 7;
              if (totalPages <= maxButtons) {
                for (let i = 1; i <= totalPages; i++) {
                  items.push(
                    <PaginationItem key={i}>
                      <button className={`btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-light'}`} onClick={() => goToPage(i)}>{i}</button>
                    </PaginationItem>
                  );
                }
              } else {
                const addBtn = (i) => (
                  <PaginationItem key={i}>
                    <button className={`btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-light'}`} onClick={() => goToPage(i)}>{i}</button>
                  </PaginationItem>
                );
                items.push(addBtn(1));
                if (currentPage > 3) items.push(<PaginationEllipsis key="l" />);
                const s = Math.max(2, currentPage - 1);
                const e = Math.min(totalPages - 1, currentPage + 1);
                for (let i = s; i <= e; i++) items.push(addBtn(i));
                if (currentPage < totalPages - 2) items.push(<PaginationEllipsis key="r" />);
                items.push(addBtn(totalPages));
              }
              return items;
            })()}
            <PaginationItem>
              <button className="btn btn-sm" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Sau</button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

function formatDateTime(v) {
  if (!v) return '';
  const d = new Date(v);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

