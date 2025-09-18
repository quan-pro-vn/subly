import { Fragment, useMemo } from 'react';
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
  const pluginContent = useMemo(() => generatePluginContent(), []);

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

  const downloadZip = () => {
    const blob = makeZipBlob('shop-check.php', pluginContent);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shop-check.zip';
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
            <button type="button" className="btn btn-sm btn-light" onClick={downloadZip}>
              Tải plugin (.zip)
            </button>
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
                <pre className="code-block whitespace-pre-wrap break-words p-3 rounded border bg-muted/30 text-xs overflow-auto max-h-96"><code>{pluginContent}</code></pre>
              </details>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h3 className="card-title">Bước 2 — Sử dụng</h3>
            </div>
            <div className="card-body space-y-2 text-sm">
              <ul className="list-disc ps-5 space-y-1">
                <li>Shortcode: <code className="px-1 rounded bg-muted">[shop_check]</code> hoặc <code className="px-1 rounded bg-muted">[shop_check render="text"]</code></li>
                <li>REST API: <code className="px-1 rounded bg-muted">GET /wp-json/shop-check/v1/status</code> (thêm <code>?refresh=1</code> để bỏ qua cache)</li>
                <li>Admin Bar: hiển thị trạng thái “Shop: Valid/Expired/Not Found”.</li>
                <li>Admin notice: cảnh báo khi hết hạn/không tìm thấy (chỉ admin).</li>
                <li>Tự động vô hiệu hoá frontend (HTTP 503) nếu trạng thái <code>expired</code> hoặc <code>not_found</code>; WP Admin và trang đăng nhập vẫn truy cập được.</li>
              </ul>
            </div>
          </section>
        </div>
      </Container>
    </Fragment>
  );
}

function generatePluginContent() {
  return `<?php\n/**\n * Plugin Name: Shop Check (MU)\n * Description: Kiểm tra trạng thái shop qua API /api/shops/check. Shortcode [shop_check], REST /wp-json/shop-check/v1/status, Admin Bar indicator.\n * Version:     1.0.0\n * Author:      You\n */\n\nif (!defined('ABSPATH')) exit;\n\nclass WP_Shop_Check {\n  const TRANSIENT_KEY = 'shop_check_status_cache';\n  const CACHE_TTL     = 300; // 5 phút\n\n  public static function bootstrap() {\n    add_action('init', [__CLASS__, 'register_shortcode']);\n    add_action('rest_api_init', [__CLASS__, 'register_rest']);\n    add_action('admin_bar_menu', [__CLASS__, 'admin_bar_status'], 100);\n    add_action('admin_notices', [__CLASS__, 'admin_notice']);\n  }\n\n  public static function api_base() {\n    $base = defined('SHOP_CHECK_API_BASE') ? SHOP_CHECK_API_BASE : '';\n    return apply_filters('shop_check_api_base', rtrim($base, '/'));\n  }\n\n  public static function resolve_params() {\n    $shop_uuid = defined('SHOP_CHECK_SHOP_UUID') ? SHOP_CHECK_SHOP_UUID : '';\n    $force_domain = defined('SHOP_CHECK_FORCE_DOMAIN') ? SHOP_CHECK_FORCE_DOMAIN : '';\n    $domain = $force_domain ?: parse_url(home_url(), PHP_URL_HOST);\n    $params = [];\n    if (!empty($shop_uuid)) { $params['shop_uuid'] = $shop_uuid; } else { $params['domain'] = $domain; }\n    return apply_filters('shop_check_params', $params);\n  }\n\n  public static function fetch_status($bypass_cache = false) {\n    $api = self::api_base();\n    if (empty($api)) { return new WP_Error('shop_check_no_api', 'Chưa cấu hình SHOP_CHECK_API_BASE'); }\n    if (!$bypass_cache) { $cached = get_transient(self::TRANSIENT_KEY); if ($cached) return $cached; }\n    $params = self::resolve_params();\n    $url = add_query_arg($params, $api . '/shops/check');\n    $args = [ 'timeout' => 5, 'headers' => [ 'Accept' => 'application/json', 'User-Agent' => 'WP-Shop-Check/1.0; ' . home_url(), ], ];\n    $res = wp_remote_get($url, $args);\n    if (is_wp_error($res)) return $res;\n    $code = wp_remote_retrieve_response_code($res);\n    $body = wp_remote_retrieve_body($res);\n    $data = json_decode($body, true);\n    if ($code !== 200 || !is_array($data)) { return new WP_Error('shop_check_bad_response', 'Phản hồi không hợp lệ từ API', ['code' => $code, 'body' => $body]); }\n    $status = isset($data['status']) ? $data['status'] : 'unknown';\n    $normalized = [ 'status' => $status, 'active' => isset($data['active']) ? !!$data['active'] : null, 'unlimited' => isset($data['unlimited']) ? !!$data['unlimited'] : null, 'expired_at' => isset($data['expired_at']) ? $data['expired_at'] : null, 'days_remaining' => isset($data['days_remaining']) ? intval($data['days_remaining']) : null, 'shop_uuid' => isset($data['shop_uuid']) ? $data['shop_uuid'] : null, 'domain' => isset($data['domain']) ? $data['domain'] : null, 'now' => isset($data['now']) ? $data['now'] : null, '_checked_at' => current_time('mysql'), ];\n    set_transient(self::TRANSIENT_KEY, $normalized, self::CACHE_TTL);\n    return $normalized;\n  }\n\n  public static function register_shortcode() {\n    add_shortcode('shop_check', function($atts) {\n      $atts = shortcode_atts(['render' => 'badge'], $atts, 'shop_check');\n      $res = self::fetch_status(false);\n      if (is_wp_error($res)) { return '<span style="color:#b91c1c">Shop Check lỗi: '.esc_html($res->get_error_message()).'</span>'; }\n      $status = $res['status'];\n      $label  = self::status_label($status, $res);\n      if ($atts['render'] === 'text') { return esc_html($label); }\n      $color = ($status === 'valid') ? '#16a34a' : (($status === 'expired') ? '#dc2626' : '#6b7280');\n      $style = 'display:inline-block;padding:2px 8px;border-radius:999px;background:'.$color.';color:#fff;font-size:12px;';\n      return '<span style="'.esc_attr($style).'">'.esc_html($label).'</span>';\n    });\n  }\n\n  public static function register_rest() {\n    register_rest_route('shop-check/v1', '/status', [ 'methods' => 'GET', 'callback' => function(WP_REST_Request $req) { $bypass = $req->get_param('refresh') ? true : false; $res = self::fetch_status($bypass); if (is_wp_error($res)) { return new WP_REST_Response(['error' => $res->get_error_message()], 500); } return rest_ensure_response($res); }, 'permission_callback' => '__return_true', ]);\n  }\n\n  public static function admin_bar_status($wp_admin_bar) {\n    if (!is_admin_bar_showing()) return;\n    $res = self::fetch_status(false);\n    if (is_wp_error($res)) return;\n    $status = $res['status'];\n    $label  = self::status_label($status, $res);\n    $color  = ($status === 'valid') ? '#16a34a' : (($status === 'expired') ? '#dc2626' : '#6b7280');\n    $wp_admin_bar->add_node([ 'id' => 'shop-check-status', 'title' => sprintf('<span style="color:%s">Shop: %s</span>', esc_attr($color), esc_html($label)), 'href' => admin_url('site-health.php'), 'meta' => ['title' => 'Shop status'], ]);\n  }\n\n  public static function admin_notice() {\n    if (!current_user_can('manage_options')) return;\n    $res = self::fetch_status(false);\n    if (is_wp_error($res)) return;\n    if (in_array($res['status'], ['expired', 'not_found', 'unknown'], true)) {\n      $msg = 'Trạng thái shop: ' . self::status_label($res['status'], $res);\n      echo '<div class="notice notice-error"><p>' . esc_html($msg) . '</p></div>';\n    }\n  }\n\n  private static function status_label($status, $res) {\n    switch ($status) {\n      case 'valid':\n        $days = is_numeric($res['days_remaining']) ? intval($res['days_remaining']) : null;\n        if (!empty($res['unlimited'])) return 'Còn hạn (Không giới hạn)';\n        if ($days !== null) return 'Còn hạn (' . $days . ' ngày)';\n        return 'Còn hạn';\n      case 'expired':\n        $days = is_numeric($res['days_remaining']) ? intval($res['days_remaining']) : null;\n        if ($days !== null) return 'Hết hạn (' . $days . ' ngày)';\n        return 'Hết hạn';\n      case 'not_found':\n        return 'Không tìm thấy';\n      default:\n        return 'Không xác định';\n    }\n  }\n}\n\nWP_Shop_Check::bootstrap();\n`;
}

// Create a minimal ZIP (store method) containing a single file
function makeZipBlob(fileName, content) {
  const enc = new TextEncoder();
  const nameBytes = enc.encode(fileName);
  const data = enc.encode(content);

  const crc = crc32(data);

  const now = new Date();
  const dosTime = ((now.getHours() & 31) << 11) | ((now.getMinutes() & 63) << 5) | ((Math.floor(now.getSeconds() / 2)) & 31);
  const dosDate = (((now.getFullYear() - 1980) & 127) << 9) | (((now.getMonth() + 1) & 15) << 5) | (now.getDate() & 31);

  // Local file header
  const localHeaderSize = 30 + nameBytes.length;
  const local = new Uint8Array(localHeaderSize + data.length);
  const dvL = new DataView(local.buffer);
  let o = 0;
  dvL.setUint32(o, 0x04034b50, true); o += 4; // signature
  dvL.setUint16(o, 20, true); o += 2; // version needed
  dvL.setUint16(o, 0, true); o += 2;  // flags
  dvL.setUint16(o, 0, true); o += 2;  // method: store
  dvL.setUint16(o, dosTime, true); o += 2; // mod time
  dvL.setUint16(o, dosDate, true); o += 2; // mod date
  dvL.setUint32(o, crc >>> 0, true); o += 4; // CRC32
  dvL.setUint32(o, data.length, true); o += 4; // comp size
  dvL.setUint32(o, data.length, true); o += 4; // uncomp size
  dvL.setUint16(o, nameBytes.length, true); o += 2; // name length
  dvL.setUint16(o, 0, true); o += 2; // extra length
  local.set(nameBytes, o); o += nameBytes.length;
  local.set(data, o); o += data.length;

  const localHeaderOffset = 0;

  // Central directory header
  const centralHeaderSize = 46 + nameBytes.length;
  const central = new Uint8Array(centralHeaderSize);
  const dvC = new DataView(central.buffer);
  let c = 0;
  dvC.setUint32(c, 0x02014b50, true); c += 4; // signature
  dvC.setUint16(c, 20, true); c += 2; // version made by
  dvC.setUint16(c, 20, true); c += 2; // version needed
  dvC.setUint16(c, 0, true); c += 2;  // flags
  dvC.setUint16(c, 0, true); c += 2;  // method
  dvC.setUint16(c, dosTime, true); c += 2;
  dvC.setUint16(c, dosDate, true); c += 2;
  dvC.setUint32(c, crc >>> 0, true); c += 4;
  dvC.setUint32(c, data.length, true); c += 4;
  dvC.setUint32(c, data.length, true); c += 4;
  dvC.setUint16(c, nameBytes.length, true); c += 2; // name length
  dvC.setUint16(c, 0, true); c += 2; // extra length
  dvC.setUint16(c, 0, true); c += 2; // comment length
  dvC.setUint16(c, 0, true); c += 2; // disk number start
  dvC.setUint16(c, 0, true); c += 2; // internal attrs
  dvC.setUint32(c, 0, true); c += 4; // external attrs
  dvC.setUint32(c, localHeaderOffset, true); c += 4; // relative offset of local header
  central.set(nameBytes, c); c += nameBytes.length;

  // End of central directory
  const EOCD_SIZE = 22;
  const eocd = new Uint8Array(EOCD_SIZE);
  const dvE = new DataView(eocd.buffer);
  let e = 0;
  dvE.setUint32(e, 0x06054b50, true); e += 4; // signature
  dvE.setUint16(e, 0, true); e += 2; // number of this disk
  dvE.setUint16(e, 0, true); e += 2; // number of the disk with start of central dir
  dvE.setUint16(e, 1, true); e += 2; // entries on this disk
  dvE.setUint16(e, 1, true); e += 2; // total entries
  dvE.setUint32(e, central.length, true); e += 4; // size of central dir
  dvE.setUint32(e, local.length, true); e += 4; // offset of central dir
  dvE.setUint16(e, 0, true); e += 2; // comment length

  // Concatenate parts
  const out = new Uint8Array(local.length + central.length + eocd.length);
  out.set(local, 0);
  out.set(central, local.length);
  out.set(eocd, local.length + central.length);
  return new Blob([out], { type: 'application/zip' });
}

function crc32(bytes) {
  let c = 0 ^ -1;
  for (let i = 0; i < bytes.length; i++) {
    c = (c >>> 8) ^ CRC32_TABLE[(c ^ bytes[i]) & 0xff];
  }
  return (c ^ -1) >>> 0;
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
})();
