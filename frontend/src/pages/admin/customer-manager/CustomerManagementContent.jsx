import { useEffect, useState } from 'react';
import { listCustomers, deleteCustomer as apiDeleteCustomer } from '@/api/customers';
import { toast } from 'sonner';

const CustomerManagementContent = ({ refreshKey = 0 }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listCustomers();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const deleteItem = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khách hàng này?')) return;
    try {
      await apiDeleteCustomer(id);
      setItems((prev) => prev.filter((u) => u.id !== id));
      toast.success('Đã xóa khách hàng', { richColors: true });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Xóa thất bại', {
        richColors: true,
      });
    }
  };

  return (
    <div>
      <div className="card-container mt-2">
        <div className="card-content">
          {error && <div className="text-red-600 mb-2">{error}</div>}

          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[280px]">Họ tên</th>
                <th className="min-w-[260px]">Email</th>
                <th className="min-w-[160px]">Số điện thoại</th>
                <th className="min-w-[180px]">Tạo lúc</th>
                <th className="min-w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Đang tải...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5}>Không có khách hàng</td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id}>
                    <td>{it.name || '-'}</td>
                    <td>{it.email}</td>
                    <td>{it.phone || '-'}</td>
                    <td>{it.created_at ? new Date(it.created_at).toLocaleString() : '-'}</td>
                    <td>
                      <div className="flex gap-2">
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
    </div>
  );
};

export { CustomerManagementContent };
