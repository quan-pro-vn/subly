import { useEffect, useState } from 'react';
import { listCustomersByShop } from '@/api/customers';
import { removeShopCustomer } from '@/api/shops';
import { toast } from 'sonner';

export default function ShopCustomersSection({ shop }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    if (!shop?.uuid) return;
    try {
      setLoading(true);
      setError('');
      const data = await listCustomersByShop(shop.uuid);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop?.uuid]);

  const removeManager = async (userId) => {
    if (!window.confirm('Bỏ quyền quản lý của khách hàng này?')) return;
    try {
      await removeShopCustomer(shop.id, userId);
      setItems((prev) => prev.filter((u) => u.id !== userId));
      toast.success('Đã bỏ quản lý', { richColors: true });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Thao tác thất bại', {
        richColors: true,
      });
    }
  };

  return (
    <div className="card-container mt-5">
      <div className="card-content">
        <div className="text-lg font-semibold mb-3">Khách hàng quản lý shop</div>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <table className="table">
          <thead>
            <tr>
              <th className="min-w-[280px]">Họ tên</th>
              <th className="min-w-[260px]">Email</th>
              <th className="min-w-[160px]">Số điện thoại</th>
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
                <td colSpan={4}>Chưa có khách hàng quản lý</td>
              </tr>
            ) : (
              items.map((it) => (
                <tr key={it.id}>
                  <td>{it.name || '-'}</td>
                  <td>{it.email}</td>
                  <td>{it.phone || '-'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline border border-gray-400"
                      onClick={() => removeManager(it.id)}
                    >
                      Bỏ quản lý
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

