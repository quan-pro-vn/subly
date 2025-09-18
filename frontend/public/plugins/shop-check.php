<?php
/**
 * Plugin Name: Shop Check (MU)
 * Description: Kiểm tra trạng thái shop qua API. Shortcode [shop_check], REST /wp-json/shop-check/v1/status, Admin Bar indicator. Tự động vô hiệu hoá frontend khi hết hạn (không chặn WP Admin / trang đăng nhập).
 * Version:     1.1.0
 * Author:      Subly
 */

if (!defined('ABSPATH')) exit;

class WP_Shop_Check {
  const TRANSIENT_KEY = 'shop_check_status_cache';
  const CACHE_TTL     = 300; // 5 phút
  const API_ENDPOINT  = 'http://subly.quan.pro.vn/api/shops/check';

  public static function bootstrap() {
    add_action('init', [__CLASS__, 'hard_block_if_expired'], 1);
    add_action('init', [__CLASS__, 'register_shortcode']);
    add_action('rest_api_init', [__CLASS__, 'register_rest']);
    add_action('admin_bar_menu', [__CLASS__, 'admin_bar_status'], 100);
    add_action('admin_notices', [__CLASS__, 'admin_notice']);
  }

  public static function api_base() { return self::API_ENDPOINT; }

  public static function resolve_params() {
    $shop_uuid    = defined('SHOP_CHECK_SHOP_UUID') ? SHOP_CHECK_SHOP_UUID : '';
    $force_domain = defined('SHOP_CHECK_FORCE_DOMAIN') ? SHOP_CHECK_FORCE_DOMAIN : '';
    $domain       = $force_domain ?: parse_url(home_url(), PHP_URL_HOST);
    $params = [];
    if (!empty($shop_uuid)) { $params['shop_uuid'] = $shop_uuid; } else { $params['domain'] = $domain; }
    return apply_filters('shop_check_params', $params);
  }

  public static function fetch_status($bypass_cache = false) {
    if (!$bypass_cache) {
      $cached = get_transient(self::TRANSIENT_KEY);
      if ($cached) return $cached;
    }
    $url  = add_query_arg(self::resolve_params(), self::api_base());
    $args = [ 'timeout' => 5, 'headers' => [ 'Accept' => 'application/json', 'User-Agent' => 'WP-Shop-Check/1.1; ' . home_url(), ], ];
    $res  = wp_remote_get($url, $args);
    if (is_wp_error($res)) return $res;
    $code = wp_remote_retrieve_response_code($res);
    $body = wp_remote_retrieve_body($res);
    $data = json_decode($body, true);
    if ($code !== 200 || !is_array($data)) {
      return new WP_Error('shop_check_bad_response', 'Phản hồi không hợp lệ từ API', ['code' => $code, 'body' => $body]);
    }
    $status = isset($data['status']) ? $data['status'] : 'unknown';
    $normalized = [
      'status'         => $status,
      'active'         => isset($data['active']) ? !!$data['active'] : null,
      'unlimited'      => isset($data['unlimited']) ? !!$data['unlimited'] : null,
      'expired_at'     => isset($data['expired_at']) ? $data['expired_at'] : null,
      'days_remaining' => isset($data['days_remaining']) ? intval($data['days_remaining']) : null,
      'shop_uuid'      => isset($data['shop_uuid']) ? $data['shop_uuid'] : null,
      'domain'         => isset($data['domain']) ? $data['domain'] : null,
      'now'            => isset($data['now']) ? $data['now'] : null,
      '_checked_at'    => current_time('mysql'),
    ];
    set_transient(self::TRANSIENT_KEY, $normalized, self::CACHE_TTL);
    return $normalized;
  }

  public static function register_shortcode() {
    add_shortcode('shop_check', function($atts) {
      $atts = shortcode_atts(['render' => 'badge'], $atts, 'shop_check');
      $res  = self::fetch_status(false);
      if (is_wp_error($res)) {
        return '<span style="color:#b91c1c">Shop Check lỗi: ' . esc_html($res->get_error_message()) . '</span>';
      }
      $status = $res['status'];
      $label  = self::status_label($status, $res);
      if ($atts['render'] === 'text') return esc_html($label);
      $color = ($status === 'valid') ? '#16a34a' : (($status === 'expired') ? '#dc2626' : '#6b7280');
      $style = 'display:inline-block;padding:2px 8px;border-radius:999px;background:' . $color . ';color:#fff;font-size:12px;';
      return '<span style="' . esc_attr($style) . '">' . esc_html($label) . '</span>';
    });
  }

  public static function register_rest() {
    register_rest_route('shop-check/v1', '/status', [
      'methods'  => 'GET',
      'callback' => function(WP_REST_Request $req) {
        $bypass = $req->get_param('refresh') ? true : false;
        $res = self::fetch_status($bypass);
        if (is_wp_error($res)) {
          return new WP_REST_Response(['error' => $res->get_error_message()], 500);
        }
        return rest_ensure_response($res);
      },
      'permission_callback' => '__return_true',
    ]);
  }

  public static function admin_bar_status($wp_admin_bar) {
    if (!is_admin_bar_showing()) return;
    $res = self::fetch_status(false);
    if (is_wp_error($res)) return;
    $status = $res['status'];
    $label  = self::status_label($status, $res);
    $color  = ($status === 'valid') ? '#16a34a' : (($status === 'expired') ? '#dc2626' : '#6b7280');
    $wp_admin_bar->add_node([
      'id'    => 'shop-check-status',
      'title' => sprintf('<span style="color:%s">Shop: %s</span>', esc_attr($color), esc_html($label)),
      'href'  => admin_url('site-health.php'),
      'meta'  => ['title' => 'Shop status'],
    ]);
  }

  public static function admin_notice() {
    if (!current_user_can('manage_options')) return;
    $res = self::fetch_status(false);
    if (is_wp_error($res)) return;
    if (in_array($res['status'], ['expired', 'not_found', 'unknown'], true)) {
      $msg = 'Trạng thái shop: ' . self::status_label($res['status'], $res);
      echo '<div class="notice notice-error"><p>' . esc_html($msg) . '</p></div>';
    }
  }

  public static function hard_block_if_expired() {
    // Bỏ qua WP Admin và trang đăng nhập
    if (is_admin() || self::is_login_page()) return;
    $res = self::fetch_status(false);
    if (is_wp_error($res)) return;
    if (in_array($res['status'], ['expired','not_found'], true)) {
      if (!headers_sent()) {
        status_header(503);
        if (function_exists('nocache_headers')) nocache_headers();
        header('Retry-After: 300');
      }
      wp_die('Tạm ngưng: shop của bạn đã hết hạn hoặc không tồn tại. Liên hệ hỗ trợ để gia hạn.', 'Site Disabled', ['response' => 503]);
    }
  }

  private static function is_login_page() {
    $p = isset($GLOBALS['pagenow']) ? $GLOBALS['pagenow'] : '';
    return in_array($p, ['wp-login.php','wp-register.php'], true);
  }

  private static function status_label($status, $res) {
    switch ($status) {
      case 'valid':
        $days = is_numeric($res['days_remaining']) ? intval($res['days_remaining']) : null;
        if (!empty($res['unlimited'])) return 'Còn hạn (Không giới hạn)';
        if ($days !== null) return 'Còn hạn (' . $days . ' ngày)';
        return 'Còn hạn';
      case 'expired':
        $days = is_numeric($res['days_remaining']) ? intval($res['days_remaining']) : null;
        if ($days !== null) return 'Hết hạn (' . $days . ' ngày)';
        return 'Hết hạn';
      case 'not_found':
        return 'Không tìm thấy';
      default:
        return 'Không xác định';
    }
  }
}

WP_Shop_Check::bootstrap();

