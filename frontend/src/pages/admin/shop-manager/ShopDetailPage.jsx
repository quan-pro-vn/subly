import { Fragment, useEffect, useState } from 'react';
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
import { getShop, listShopRenewals, renewShop } from '@/api/shops';
import ShopCustomersSection from './ShopCustomersSection';

export default function ShopDetailPage() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [months, setMonths] = useState(1);
  const [renewals, setRenewals] = useState([]);
  const [renewing, setRenewing] = useState(false);

  const fetchShop = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getShop(id);
      setShop(data);
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

  useEffect(() => {
    fetchShop();
    fetchRenewals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onRenew = async () => {
    const m = parseInt(months, 10) || 0;
    if (m <= 0) return alert('Số tháng phải > 0');
    try {
      setRenewing(true);
      const res = await renewShop(id, m);
      if (res?.shop) setShop(res.shop);
      await fetchRenewals();
      alert('Gia hạn thành công');
    } catch (e) {
      alert(e?.response?.data?.error || 'Gia hạn thất bại');
    } finally {
      setRenewing(false);
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
                <div className="flex items-end gap-3">
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
