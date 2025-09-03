import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const createSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

const editSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự').optional().or(z.literal('')),
});

export default function UserModal({
  isOpen,
  mode = 'create',
  defaultValues = { name: '', email: '', password: '' },
  original = null,
  onClose,
  onSubmit,
  title,
}) {
  const schema = mode === 'create' ? createSchema : editSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // ✅ Chỉ reset khi mở modal (và/hoặc đổi mode)
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
    // ⛔ đừng đưa defaultValues vào deps để tránh loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode]);

  const values = watch();
  const changedPayload = useMemo(() => {
    if (mode !== 'edit' || !original) return values;
    const payload = {};
    if (values.name !== original.name) payload.name = values.name;
    if (values.email !== original.email) payload.email = values.email;
    if (values.password && values.password.trim() !== '') payload.password = values.password;
    return payload;
  }, [values, mode, original]);

  const submit = async () => {
    if (mode === 'edit' && original && Object.keys(changedPayload).length === 0) {
      onClose?.();
      return;
    }
    await onSubmit?.(mode === 'edit' ? changedPayload : values);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-4 w-[480px] max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-3">
          {title ?? (mode === 'create' ? 'Tạo người dùng' : 'Sửa người dùng')}
        </h3>

        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Họ tên</label>
            <input className="input input-bordered w-full" placeholder="Họ và tên" {...register('name')} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="input input-bordered w-full" placeholder="Email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">
              {mode === 'create' ? 'Mật khẩu' : 'Mật khẩu (bỏ trống nếu không đổi)'}
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              placeholder={mode === 'create' ? 'Mật khẩu (≥ 6 ký tự)' : 'Để trống nếu không đổi'}
              {...register('password')}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={() => onClose?.()} disabled={isSubmitting}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
