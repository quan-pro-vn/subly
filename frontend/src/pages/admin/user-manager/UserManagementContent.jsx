import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { listUsers, deleteUser as apiDeleteUser, updateUser as apiUpdateUser } from '@/api/users';
import { getMe } from '@/api/auth';
import UserModal from './UserModal';

const UserManagementContent = ({ refreshKey = 0 }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [meLoading, setMeLoading] = useState(true);

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

  const fetchMe = async () => {
    try {
      setMeLoading(true);
      const me = await getMe();
      setCurrentUserId(me?.id ?? null);
    } catch (e) {
      console.error('Không lấy được user hiện tại', e);
    } finally {
      setMeLoading(false);
    }
  };

  // lấy me 1 lần khi mount
  useEffect(() => {
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch list theo refreshKey
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const startEdit = (u) => setEditing(u);
  const cancelEdit = () => setEditing(null);

  const saveEdit = async (payload) => {
    if (!editing) return;
    try {
      const updated = await apiUpdateUser(editing.id, payload);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      toast.success('Cập nhật thành công', { richColors: true });
      cancelEdit();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Cập nhật thất bại', { richColors: true });
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await apiDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('Đã xóa người dùng', { richColors: true });
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Xóa thất bại', { richColors: true });
    }
  };

  // 🧠 Memo defaultValues để tránh identity thay đổi liên tục gây reset loop
  const editDefaults = useMemo(() => {
    if (!editing) return undefined;
    return {
      name: editing.name || '',
      email: editing.email || '',
      password: '',
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
                        <button
                          className="btn btn-sm btn-primary flex justify-center"
                          onClick={() => startEdit(u)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline border border-gray-400 flex justify-center"
                          disabled={String(u.id) === String(currentUserId) || meLoading}
                          onClick={() => deleteUser(u.id)}
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

      <UserModal
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

export { UserManagementContent };
