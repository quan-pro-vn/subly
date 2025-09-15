import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const createSchema = z.object({
  domain: z
    .string()
    .min(1, 'Vui lòng nhập domain')
    .regex(/^[a-z0-9.-]+$/i, 'Domain chỉ gồm chữ, số, dấu . và -'),
  expired_at: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
      'Ngày hết hạn không hợp lệ (YYYY-MM-DD)'
    ),
});

const editSchema = createSchema;

export default function ShopModal({
  isOpen,
  mode = 'create',
  defaultValues = { domain: '', expired_at: '' },
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
    if (values.domain !== original.domain) payload.domain = values.domain;
    // Map expired_at from YYYY-MM-DD (UI) to ISO string (UTC midnight)
    const origDate = original.expired_at
      ? new Date(original.expired_at)
      : null;
    const uiChanged = values.expired_at !== (origDate ? formatDate(origDate) : '');
    if (uiChanged) {
      payload.expired_at = values.expired_at
        ? new Date(values.expired_at + 'T00:00:00Z').toISOString()
        : null;
    }
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
    let payload;
    if (mode === 'edit') {
      payload = changedPayload;
    } else {
      payload = { domain: values.domain };
      payload.expired_at = values.expired_at
        ? new Date(values.expired_at + 'T00:00:00Z').toISOString()
        : null;
    }
    await onSubmit?.(payload);
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

          <div>
            <label className="block text-sm mb-1">Ngày hết hạn</label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={values.expired_at || ''}
              onChange={(e) => setValue('expired_at', e.target.value)}
            />
            {errors.expired_at && (
              <p className="mt-1 text-xs text-red-600">
                {errors.expired_at.message}
              </p>
            )}
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

// Helper to format Date -> YYYY-MM-DD
function formatDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
