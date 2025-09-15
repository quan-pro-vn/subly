import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên shop'),
  domain: z
    .string()
    .min(1, 'Vui lòng nhập domain')
    .regex(/^[a-z0-9.-]+$/i, 'Domain chỉ gồm chữ, số, dấu . và -'),
  active: z.boolean().default(true),
});

const editSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên shop'),
  domain: z
    .string()
    .min(1, 'Vui lòng nhập domain')
    .regex(/^[a-z0-9.-]+$/i, 'Domain chỉ gồm chữ, số, dấu . và -'),
  active: z.boolean().default(true),
});

export default function ShopModal({
  isOpen,
  mode = 'create',
  defaultValues = { name: '', domain: '', active: true },
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
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  // Reset values when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode]);

  const values = watch();
  const changedPayload = useMemo(() => {
    if (mode !== 'edit' || !original) return values;
    const payload = {};
    if (values.name !== original.name) payload.name = values.name;
    if (values.domain !== original.domain) payload.domain = values.domain;
    if (Boolean(values.active) !== Boolean(original.active))
      payload.active = Boolean(values.active);
    return payload;
  }, [values, mode, original]);

  const submit = async () => {
    if (
      mode === 'edit' &&
      original &&
      Object.keys(changedPayload).length === 0
    ) {
      onClose?.();
      return;
    }
    await onSubmit?.(mode === 'edit' ? changedPayload : values);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-4 w-[520px] max-w-[92vw]">
        <h3 className="text-lg font-semibold mb-3">
          {title ?? (mode === 'create' ? 'Tạo shop' : 'Sửa shop')}
        </h3>

        <form onSubmit={handleSubmit(submit)} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Tên shop</label>
            <input
              className="input input-bordered w-full"
              placeholder="Ví dụ: Cửa hàng ABC"
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Domain</label>
            <input
              className="input input-bordered w-full"
              placeholder="vd: abcshop.vn hoặc abc.example.com"
              {...register('domain')}
            />
            {errors.domain && (
              <p className="mt-1 text-xs text-red-600">
                {errors.domain.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              className="checkbox"
              checked={!!values.active}
              onChange={(e) => setValue('active', e.target.checked)}
            />
            <label htmlFor="active" className="text-sm">
              Kích hoạt
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => onClose?.()}
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
  );
}

