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
import { getShop } from '@/api/shops';
import ShopCustomersSection from './ShopCustomersSection';

export default function ShopDetailPage() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  useEffect(() => {
    fetchShop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
