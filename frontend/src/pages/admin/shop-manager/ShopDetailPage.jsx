import { Fragment, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@/components/common/container';
import PageTitle from '@/components/common/page-title';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/components/layouts/layout-1/components/toolbar';
import { getShop, listShopRenewals, renewShop, listShopApiLogs, setShopExpiredAt } from '@/api/shops';
import ShopCustomersSection from './ShopCustomersSection';

export default function ShopDetailPage() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [months, setMonths] = useState(12);
  const [nextDate, setNextDate] = useState('');
  const [note, setNote] = useState('');
  const monthlyPrice = useMemo(() => {
    if (!shop) return 0;
    const price = Number(shop.price_per_cycle || 0);
    const cycle = Number(shop.cycle_months || 12);
    return cycle > 0 ? price / cycle : 0;
  }, [shop]);

  const estimate = useMemo(() => {
    if (!shop) return null;
    const price = Number(shop.price_per_cycle || 0);
    const cycle = Number(shop.cycle_months || 12);
    if (price <= 0 || cycle <= 0) return null;
    const base = (() => {
      const now = new Date();
      if (shop.expired_at) {
        const exp = new Date(shop.expired_at);
        return exp.getTime() > now.getTime() ? exp : now;
      }
      return now;
    })();
    let monthsToCharge = 0;
    if (nextDate) {
      try {
        const target = new Date(nextDate + 'T00:00:00Z');
        // approximate months: difference in year*12 + month, bump if addMonths(base, months)<target
        const diff = (target.getUTCFullYear() - base.getUTCFullYear()) * 12 + (target.getUTCMonth() - base.getUTCMonth());
        const addMonths = (dt, n) => {
          const y = dt.getUTCFullYear();
          const m = dt.getUTCMonth();
          const d = dt.getUTCDate();
          const ny = y + Math.floor((m + n) / 12);
          const nm = (m + n) % 12;
          const firstOfNext = new Date(Date.UTC(ny, nm + 1, 1));
          const lastDay = new Date(firstOfNext.getTime() - 24 * 60 * 60 * 1000).getUTCDate();
          const nd = Math.min(d, lastDay);
          return new Date(Date.UTC(ny, nm, nd, dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds()));
        };
        let m = Math.max(0, diff);
        if (addMonths(base, m).getTime() < target.getTime()) m++;
        monthsToCharge = m;
      } catch {
        monthsToCharge = 0;
      }
    } else {
      monthsToCharge = Math.max(0, parseInt(months, 10) || 0);
    }
    const est = Math.round((price / cycle) * monthsToCharge);
    return {
      months: monthsToCharge,
      amount: est,
    };
  }, [shop, months, nextDate]);
  const [renewals, setRenewals] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);
  const [renewing, setRenewing] = useState(false);
  const [editExpDate, setEditExpDate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchShop = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getShop(id);
      setShop(data);
      try {
        if (data?.expired_at) {
          const d = new Date(data.expired_at);
          const y = d.getUTCFullYear();
          const m = String(d.getUTCMonth() + 1).padStart(2, '0');
          const day = String(d.getUTCDate()).padStart(2, '0');
          setEditExpDate(`${y}-${m}-${day}`);
        } else {
          setEditExpDate('');
        }
      } catch {
        setEditExpDate('');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Không thể tải thông tin shop');
    } finally {
      setLoading(false);
    }
  };

  const fetchRenewals = async () => {
    try {
      const data = await listShopRenewals(id);
      setRenewals(Array.isArray(data) ? data : []);
    } catch (e) {
      // ignore
    }
  };

  const fetchApiLogs = async () => {
    try {
      const data = await listShopApiLogs(id, { page: 1, limit: 50 });
      if (data && Array.isArray(data.items)) setApiLogs(data.items);
      else if (Array.isArray(data)) setApiLogs(data);
      else setApiLogs([]);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchShop();
    fetchRenewals();
    fetchApiLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onRenew = async () => {
    const m = parseInt(months, 10) || 0;
    const hasDate = !!nextDate;
    if (!hasDate && m <= 0) return alert('Số tháng phải > 0 hoặc chọn ngày');
    try {
      setRenewing(true);
      let payload;
      if (hasDate) {
        payload = { next_expired_at: new Date(nextDate + 'T00:00:00Z').toISOString(), note: note || undefined };
      } else {
        payload = { months: m, note: note || undefined };
      }
      const res = await renewShop(id, payload);
      if (res?.shop) setShop(res.shop);
      await fetchRenewals();
      alert('Gia hạn thành công');
    } catch (e) {
      alert(e?.response?.data?.error || 'Gia hạn thất bại');
    } finally {
      setRenewing(false);
    }
  };

  const onSetExpiredAt = async () => {
    if (!editExpDate) return alert('Vui lòng chọn ngày hết hạn mới');
    try {
      setSavingEdit(true);
      const payload = {
        new_expired_at: new Date(editExpDate + 'T00:00:00Z').toISOString(),
        note: editNote || undefined,
      };
      const res = await setShopExpiredAt(id, payload);
      if (res?.shop) setShop(res.shop);
      await fetchRenewals();
      alert('Cập nhật ngày hết hạn thành công');
    } catch (e) {
      alert(e?.response?.data?.error || 'Cập nhật thất bại');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <Fragment>
      <PageTitle title="Chi tiết shop" />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle>Chi tiết shop</ToolbarPageTitle>
            <ToolbarDescription>
              <div className="flex items-center flex-wrap gap-1.5 font-medium" />
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <button className="btn btn-sm btn-outline" onClick={fetchShop}>
              Tải lại
            </button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="card-container">
          <div className="card-content">
            {error && <div className="text-red-600 mb-2">{error}</div>}
            {loading ? (
              <div>Đang tải...</div>
            ) : !shop ? (
              <div>Không tìm thấy shop</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="ID">{shop.id}</Field>
                <Field label="UUID">
                  <code className="text-xs">{shop.uuid}</code>
                </Field>
                <Field label="Domain">{shop.domain}</Field>
                <Field label="Trạng thái">{shop.active ? 'Hoạt động' : 'Tắt'}</Field>
                <Field label="Hết hạn">
                  {shop.expired_at ? formatDate(new Date(shop.expired_at)) : '-'}
                </Field>
                <Field label="Giá/ kỳ">
                  {shop.price_per_cycle?.toLocaleString?.('vi-VN') || shop.price_per_cycle} ₫ / {shop.cycle_months || 12} tháng
                </Field>
              </div>
            )}
          </div>
        </div>

        {shop && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="card-container">
              <div className="card-header">
                <div className="card-title">Gia hạn</div>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Số tháng
                    </label>
                    <input
                      type="number"
                      min={1}
                      className="input input-sm w-28"
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Đến ngày (ưu tiên)
                    </label>
                    <input
                      type="date"
                      className="input input-sm w-40"
                      value={nextDate}
                      onChange={(e) => setNextDate(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-muted-foreground mb-1">
                      Ghi chú
                    </label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      placeholder="Ví dụ: Thu tiền gia hạn 12 tháng"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3 text-sm text-muted-foreground">
                    {estimate && estimate.months > 0 ? (
                      <span>
                        Ước tính: <b>{estimate.amount.toLocaleString('vi-VN')} ₫</b>
                        {monthlyPrice > 0 && (
                          <>
                            {' '}
                            (<span>{estimate.months}</span> tháng ×{' '}
                            <span>{Math.round(monthlyPrice).toLocaleString('vi-VN')} ₫/tháng</span>)
                          </>
                        )}
                      </span>
                    ) : (
                      <span>Nhập số tháng hoặc chọn ngày để ước tính chi phí.</span>
                    )}
                  </div>
                  <div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={onRenew}
                      disabled={renewing}
                    >
                      {renewing ? 'Đang gia hạn...' : 'Gia hạn'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-container">
              <div className="card-header">
                <div className="card-title">Chỉnh sửa ngày hết hạn</div>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Ngày hết hạn mới</label>
                    <input
                      type="date"
                      className="input input-sm w-40"
                      value={editExpDate}
                      onChange={(e) => setEditExpDate(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-muted-foreground mb-1">Ghi chú</label>
                    <input
                      type="text"
                      className="input input-sm w-full"
                      placeholder="Ví dụ: Chỉnh sửa thủ công theo yêu cầu"
                      value={editNote}
                      onChange={(e) => setEditNote(e.target.value)}
                    />
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline" onClick={onSetExpiredAt} disabled={savingEdit}>
                      {savingEdit ? 'Đang lưu...' : 'Cập nhật hết hạn'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-container">
              <div className="card-header">
                <div className="card-title">Lịch sử gia hạn</div>
              </div>
              <div className="card-content">
                {renewals.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Chưa có</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Thời gian</th>
                          <th>Tháng</th>
                          <th>Hết hạn cũ</th>
                          <th>Hết hạn mới</th>
                        </tr>
                      </thead>
                      <tbody>
                        {renewals.map((r) => (
                          <tr key={r.id}>
                            <td>{formatDateTime(r.created_at)}</td>
                            <td>{r.months}</td>
                            <td>{r.old_expired_at ? formatDate(new Date(r.old_expired_at)) : '-'}</td>
                            <td>{formatDate(new Date(r.new_expired_at))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
            <div className="card-container lg:col-span-2">
              <div className="card-header">
                <div className="card-title">Lịch sử gọi API</div>
              </div>
              <div className="card-content">
                {apiLogs.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Chưa có</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Thời gian</th>
                          <th>Trạng thái</th>
                          <th>Client IP</th>
                          <th>Domain param</th>
                          <th>UUID param</th>
                          <th>User Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiLogs.map((r) => (
                          <tr key={r.id}>
                            <td>{formatDateTime(r.created_at)}</td>
                            <td>{r.status}</td>
                            <td>{r.client_ip}</td>
                            <td>{r.domain_param || '-'}</td>
                            <td>{r.uuid_param || '-'}</td>
                            <td className="max-w-[360px] truncate" title={r.user_agent}>{r.user_agent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {shop && <ShopCustomersSection shop={shop} />}
      </Container>
    </Fragment>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function formatDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateTime(ts) {
  try {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return String(ts ?? '');
  }
}
