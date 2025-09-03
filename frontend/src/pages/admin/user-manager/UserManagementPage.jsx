import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/components/layouts/layout-1/components/toolbar';

import { UserManagementContent } from './UserManagementContent';
import { createUser } from '@/api/users';

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập họ tên'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});

const UserManagementPage = () => {
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const openCreate = () => {
    reset();
    setCreating(true);
  };

  const cancelCreate = () => {
    if (isSubmitting) return;
    setCreating(false);
    reset();
  };

  const onSubmit = async (values) => {
    try {
      await createUser(values);
      toast.success('Tạo nhân viên thành công', { richColors: true });
      setCreating(false);
      reset();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Tạo nhân viên thất bại';
      toast.error(msg, { richColors: true });
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <div className="flex items-center flex-wrap gap-1.5 font-medium" />
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <button type="button" onClick={openCreate} className="btn btn-sm btn-primary">
              Tạo nhân viên
            </button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <UserManagementContent refreshKey={refreshKey} />
      </Container>

      {creating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-4 w-[480px] max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-3">Tạo người dùng</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Họ tên</label>
                <input
                  className="input input-bordered w-full"
                  placeholder="Họ và tên"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  placeholder="Email"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">Mật khẩu</label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Mật khẩu (≥ 6 ký tự)"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={cancelCreate}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export { UserManagementPage };
