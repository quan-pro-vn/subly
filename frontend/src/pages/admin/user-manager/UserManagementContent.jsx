import { useEffect, useMemo, useState } from 'react';
import { listUsers, deleteUser as apiDeleteUser, updateUser as apiUpdateUser } from '../../../api/users';

const UserManagementContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // user object
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await listUsers();
      setUsers(data || []);
    } catch (e) {
      setError(e?.response?.data?.error || 'Không thể tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const startEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name || '', email: u.email || '', password: '' });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '' });
  };

  const changedPayload = useMemo(() => {
    if (!editing) return {};
    const payload = {};
    if (form.name !== editing.name) payload.name = form.name;
    if (form.email !== editing.email) payload.email = form.email;
    if (form.password) payload.password = form.password;
    return payload;
  }, [form, editing]);

  const saveEdit = async () => {
    if (!editing) return;
    const payload = changedPayload;
    if (Object.keys(payload).length === 0) {
      cancelEdit();
      return;
    }
    try {
      setSaving(true);
      const updated = await apiUpdateUser(editing.id, payload);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      cancelEdit();
    } catch (e) {
      alert(e?.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await apiDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e) {
      alert(e?.response?.data?.error || 'Xóa thất bại');
    }
  };

  return (
    <div>
      <div className="card-container mt-2">
        <div className="card-content">
          {error && (
            <div className="text-red-600 mb-2">
              {error}
            </div>
          )}
          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[300px]">Họ tên</th>
                <th className="min-w-[250px]">Email</th>
                <th className="min-w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3}>Đang tải...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={3}>Không có người dùng</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-primary flex justify-center" onClick={() => startEdit(u)}>Sửa</button>
                        <button className="btn btn-sm btn-danger flex justify-center" onClick={() => deleteUser(u.id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-4 w-[480px] max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-3">Sửa người dùng</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Họ tên</label>
                <input
                  className="input input-bordered w-full"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Mật khẩu (bỏ trống nếu không đổi)</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="btn btn-ghost" onClick={cancelEdit} disabled={saving}>Hủy</button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export { UserManagementContent };
