import { Fragment, useEffect, useState } from 'react';
import { Container } from '@/components/common/container';
import PageTitle from '@/components/common/page-title';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/components/layouts/layout-1/components/toolbar';

export default function IntegrationPage() {
  const [pluginContent, setPluginContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch('/plugins/shop-check.php');
        const txt = await res.text();
        if (!ignore) setPluginContent(txt);
      } catch (e) {
        if (!ignore) setErr('Không thể tải nội dung plugin');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const downloadPlugin = () => {
    const blob = new Blob([pluginContent], { type: 'text/x-php;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shop-check.php';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // No extra configuration required

  return (
    <Fragment>
      <PageTitle title="Tích hợp WordPress" />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              <div className="flex items-center flex-wrap gap-1.5 font-medium">
                Hướng dẫn tích hợp và tải MU plugin
              </div>
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <button type="button" className="btn btn-sm btn-primary" onClick={downloadPlugin}>
              Tải plugin (shop-check.php)
            </button>
            {null}
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="grid gap-6">
          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Bước 1 — Cài MU Plugin</h3>
            </div>
            <div className="card-body space-y-3">
              <ol className="list-decimal ps-5 space-y-1 text-sm">
                <li>Tải file plugin: nhấn nút “Tải plugin (shop-check.php)” ở trên.</li>
                <li>Tạo thư mục <code className="px-1 rounded bg-muted">wp-content/mu-plugins</code> nếu chưa có.</li>
                <li>Tải lên file <code className="px-1 rounded bg-muted">shop-check.php</code> vào thư mục đó.</li>
                <li>Plugin MU tự kích hoạt, không cần Active trong WP Admin.</li>
              </ol>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium">Xem nội dung plugin</summary>
                {loading ? (
                  <div className="p-3 text-sm text-muted-foreground">Đang tải nội dung plugin…</div>
                ) : err ? (
                  <div className="p-3 text-sm text-red-600">{err}</div>
                ) : (
                  <pre className="code-block whitespace-pre-wrap break-words p-3 rounded border bg-muted/30 text-xs overflow-auto max-h-96"><code>{pluginContent}</code></pre>
                )}
              </details>
            </div>
          </section>

          {null}
        </div>
      </Container>
    </Fragment>
  );
}
