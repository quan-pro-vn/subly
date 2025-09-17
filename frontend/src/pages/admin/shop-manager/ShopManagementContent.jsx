import { useEffect, useMemo, useState } from 'react';
import {
  deleteShop as apiDeleteShop,
  updateShop as apiUpdateShop,
  listShops,
  restoreShop as apiRestoreShop,
  forceDeleteShop as apiForceDeleteShop,
} from '@/api/shops';
import { toast } from 'sonner';
import ShopModal from './ShopModal';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';

const PAGE_SIZE = 50;

const ShopManagementContent = ({ refreshKey = 0, filter = 'all' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listShops({ page, limit: PAGE_SIZE, filter });
      if (data && Array.isArray(data.items)) {
        setItems(data.items);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      } else if (Array.isArray(data)) {
        // Backward compatibility if server returns array
        setItems(data);
        setTotal(data.length);
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Không thể tải danh sách shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refreshKey, page, filter]);

  // Reset to page 1 when filter changes or items refresh
  useEffect(() => {
    setPage(1);
  }, [filter, refreshKey]);

  const filteredItems = items; // server provides filtered and sorted data

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, total);

  const pagedItems = filteredItems; // server already paginates

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const startEdit = (it) => setEditing(it);
  const cancelEdit = () => setEditing(null);

  const saveEdit = async (payload) => {
    if (!editing) return;
    try {
      const updated = await apiUpdateShop(editing.id, payload);
      setItems((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success('Cập nhật shop thành công', { richColors: true });
      cancelEdit();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Cập nhật thất bại', {
        richColors: true,
      });
    }
  };

  const revokeNow = async (id) => {
    if (!window.confirm('Thu hồi: đặt shop hết hạn ngay bây giờ?')) return;
    try {
      const nowISO = new Date().toISOString();
      const updated = await apiUpdateShop(id, { expired_at: nowISO });
      setItems((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success('Đã thu hồi, shop hết hạn ngay', { richColors: true });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Thu hồi thất bại', {
        richColors: true,
      });
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa (mềm) shop này?')) return;
    try {
      await apiDeleteShop(id);
      // If this was the last item on the page and not the first page, go back a page
      if (items.length === 1 && page > 1) {
        setPage((p) => Math.max(1, p - 1));
      } else {
        fetchItems();
      }
      toast.success('Đã chuyển vào thùng rác', { richColors: true });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Xóa thất bại', {
        richColors: true,
      });
    }
  };

  const restoreItem = async (id) => {
    if (!window.confirm('Khôi phục shop này?')) return;
    try {
      await apiRestoreShop(id);
      fetchItems();
      toast.success('Đã khôi phục shop', { richColors: true });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Khôi phục thất bại', {
        richColors: true,
      });
    }
  };

  const forceDeleteItem = async (id) => {
    if (!window.confirm('Xóa vĩnh viễn? Hành động này không thể hoàn tác.')) return;
    try {
      await apiForceDeleteShop(id);
      fetchItems();
      toast.success('Đã xóa vĩnh viễn', { richColors: true });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Xóa vĩnh viễn thất bại', {
        richColors: true,
      });
    }
  };

  const editDefaults = useMemo(() => {
    if (!editing) return undefined;
    return {
      domain: editing.domain || '',
      expired_at: editing.expired_at
        ? formatDate(new Date(editing.expired_at))
        : '',
      price_per_cycle: editing.price_per_cycle || 2000000,
      cycle_months: editing.cycle_months || 12,
    };
  }, [editing]);

  return (
    <div>
      <div className="card-container mt-2">
        <div className="card-content">
          {error && <div className="text-red-600 mb-2">{error}</div>}

          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[260px]">UUID</th>
                <th className="min-w-[260px]">Domain</th>
                <th className="min-w-[160px]">Hết hạn</th>
                <th className="min-w-[140px]">Tình trạng</th>
                <th className="min-w-[140px]">Còn lại (ngày)</th>
                <th className="min-w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: Math.min(8, PAGE_SIZE) }).map((_, i) => (
                  <tr key={`sk-${i}`}>
                    <td className="py-3"><Skeleton className="h-4 w-[220px]" /></td>
                    <td><Skeleton className="h-4 w-[180px]" /></td>
                    <td><Skeleton className="h-4 w-[120px]" /></td>
                    <td><Skeleton className="h-5 w-[90px] rounded-full" /></td>
                    <td><Skeleton className="h-4 w-[60px]" /></td>
                    <td>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-12" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-12" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6}>Không có shop</td>
                </tr>
              ) : (
                pagedItems.map((it) => (
                  <tr key={it.id}>
                    <td className="font-mono text-xs">{it.uuid}</td>
                    <td>{it.domain}</td>
                    <td>{it.expired_at ? formatDate(new Date(it.expired_at)) : '-'}</td>
                    <td>
                      {(() => {
                        const st = computeExpiryInfo(it.expired_at);
                        return (
                          <span className={`badge ${st.className}`}>{st.label}</span>
                        );
                      })()}
                    </td>
                    <td>{computeExpiryInfo(it.expired_at).daysDisplay}</td>
                    <td>
                      <div className="flex gap-2">
                        {filter !== 'trashed' ? (
                          <>
                            <a
                              className="btn btn-sm btn-outline border border-gray-400"
                              href={`/shops/${it.id}`}
                            >
                              Chi tiết
                            </a>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => startEdit(it)}
                            >
                              Sửa
                            </button>
                            <button
                              className="btn btn-sm btn-outline border border-gray-400"
                              onClick={() => revokeNow(it.id)}
                            >
                              Thu hồi
                            </button>
                            <button
                              className="btn btn-sm btn-outline border border-gray-400"
                              onClick={() => deleteItem(it.id)}
                            >
                              Xóa
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => restoreItem(it.id)}
                            >
                              Khôi phục
                            </button>
                            <button
                              className="btn btn-sm btn-outline border border-red-500 text-red-600"
                              onClick={() => forceDeleteItem(it.id)}
                            >
                              Xóa vĩnh viễn
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {total > 0
            ? `Hiển thị ${startIndex + 1}–${endIndex} trong ${total} shop`
            : 'Không có dữ liệu'}
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Trước
              </button>
            </PaginationItem>

            {/* Page numbers: compact with ellipsis */}
            {(() => {
              const items = [];
              const maxButtons = 7;
              if (totalPages <= maxButtons) {
                for (let i = 1; i <= totalPages; i++) {
                  items.push(
                    <PaginationItem key={i}>
                      <button
                        className={`btn btn-sm ${
                          i === currentPage ? 'btn-primary' : 'btn-light'
                        }`}
                        onClick={() => goToPage(i)}
                      >
                        {i}
                      </button>
                    </PaginationItem>
                  );
                }
              } else {
                const addPageBtn = (i) => (
                  <PaginationItem key={i}>
                    <button
                      className={`btn btn-sm ${
                        i === currentPage ? 'btn-primary' : 'btn-light'
                      }`}
                      onClick={() => goToPage(i)}
                    >
                      {i}
                    </button>
                  </PaginationItem>
                );
                // Always show first
                items.push(addPageBtn(1));
                // Left ellipsis
                if (currentPage > 3) {
                  items.push(<PaginationEllipsis key="l-ell" />);
                }
                // Middle pages
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);
                for (let i = start; i <= end; i++) {
                  items.push(addPageBtn(i));
                }
                // Right ellipsis
                if (currentPage < totalPages - 2) {
                  items.push(<PaginationEllipsis key="r-ell" />);
                }
                // Always show last
                items.push(addPageBtn(totalPages));
              }
              return items;
            })()}

            <PaginationItem>
              <button
                className="btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Sau
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <ShopModal
        key={editing?.id || 'no-edit'}
        isOpen={!!editing}
        mode="edit"
        defaultValues={editDefaults}
        original={editing}
        onClose={cancelEdit}
        onSubmit={saveEdit}
      />
    </div>
  );
};

export { ShopManagementContent };

function formatDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Compute status and remaining days from expired_at ISO string
function computeExpiryInfo(expiredAtISO) {
  if (!expiredAtISO) {
    return {
      label: 'Không giới hạn',
      className: 'badge-success',
      daysDisplay: '—',
      isValid: true,
    };
  }
  const now = new Date();
  const exp = new Date(expiredAtISO);
  const diffMs = exp.getTime() - now.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const rawDays = diffMs / dayMs;
  const isValid = diffMs >= 0;
  return {
    label: isValid ? 'Còn hạn' : 'Hết hạn',
    className: isValid ? 'badge-success' : 'badge-danger',
    // Nếu đã hết hạn, hiển thị số ngày âm
    daysDisplay: isValid ? Math.ceil(rawDays) : Math.floor(rawDays),
    isValid,
  };
}
