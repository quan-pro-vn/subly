import { useEffect, useMemo, useState } from 'react';
import {
  deleteShop as apiDeleteShop,
  updateShop as apiUpdateShop,
  listShops,
} from '@/api/shops';
import { toast } from 'sonner';
import ShopModal from './ShopModal';

const ShopManagementContent = ({ refreshKey = 0 }) => {
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
      name: editing.name || '',
      domain: editing.domain || '',
      active: Boolean(editing.active),
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
                <th className="min-w-[260px]">Tên shop</th>
                <th className="min-w-[260px]">Domain</th>
                <th className="min-w-[120px]">Trạng thái</th>
                <th className="min-w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Đang tải...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4}>Không có shop</td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.name}</td>
                    <td>{it.domain}</td>
                    <td>
                      {Boolean(it.active) ? (
                        <span className="badge badge-success">Đang hoạt động</span>
                      ) : (
                        <span className="badge">Tạm dừng</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
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

