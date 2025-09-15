import { useEffect, useMemo, useState } from 'react';
import {
  deleteShop as apiDeleteShop,
  updateShop as apiUpdateShop,
  listShops,
} from '@/api/shops';
import { toast } from 'sonner';
import ShopModal from './ShopModal';

const ShopManagementContent = ({ refreshKey = 0, filter = 'all' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listShops();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Không thể tải danh sách shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    if (filter === 'all') return items;
    const now = new Date();
    const parsed = items
      .map((it) => ({
        it,
        exp: it.expired_at ? new Date(it.expired_at) : null,
      }))
      .filter(({ it, exp }) => {
        const isValid = !exp || exp.getTime() - now.getTime() >= 0;
        return filter === 'valid' ? isValid : !isValid;
      });

    if (filter === 'valid') {
      // Sort ascending by date; items without expiry come last
      parsed.sort((a, b) => {
        if (!a.exp && !b.exp) return 0;
        if (!a.exp) return 1;
        if (!b.exp) return -1;
        return a.exp.getTime() - b.exp.getTime();
      });
    } else if (filter === 'expired') {
      // Sort descending by date (most recently expired first)
      parsed.sort((a, b) => {
        if (!a.exp && !b.exp) return 0;
        if (!a.exp) return 1;
        if (!b.exp) return -1;
        return b.exp.getTime() - a.exp.getTime();
      });
    }

    return parsed.map(({ it }) => it);
  }, [items, filter]);

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

  const deleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa shop này?')) return;
    try {
      await apiDeleteShop(id);
      setItems((prev) => prev.filter((u) => u.id !== id));
      toast.success('Đã xóa shop', { richColors: true });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Xóa thất bại', {
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
                <tr>
                  <td colSpan={6}>Đang tải...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6}>Không có shop</td>
                </tr>
              ) : (
                filteredItems.map((it) => (
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
                          onClick={() => deleteItem(it.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
