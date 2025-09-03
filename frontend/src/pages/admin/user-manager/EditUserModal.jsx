import { useEffect, useMemo, useState } from 'react';

const EditUserModal = ({ user, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', password: '' });
    }
  }, [user]);

  const changedPayload = useMemo(() => {
    if (!user) return {};
    const payload = {};
    if (form.name !== user.name) payload.name = form.name;
    if (form.email !== user.email) payload.email = form.email;
    if (form.password) payload.password = form.password;
    return payload;
  }, [form, user]);

  const handleSave = async () => {
    const payload = changedPayload;
    if (Object.keys(payload).length === 0) {
      onClose?.();
      return;
    }
    try {
      setSaving(true);
      await onSave?.(payload);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
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
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Hủy</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;

