<?php
/**
 * Subly WordPress SDK (include-only)
 * Base URL fixed: https://subly.quan.pro.vn
 *
 * Usage in WordPress:
 *   // wp-content/mu-plugins/subly-check.php
 *   require_once WP_CONTENT_DIR . '/plugins/subly/sdk/wordpress/shop-sdk.php';
 *   if (!shop_is_valid_auto_wp()) { wp_die('Website đã hết hạn.'); }
 */

if (!defined('SUBLY_BASE_URL')) {
    define('SUBLY_BASE_URL', 'https://subly.quan.pro.vn');
}

if (!class_exists('SublyShopClient')) {
    class SublyShopClient
    {
        private string $baseUrl;
        private int $timeout;
        private int $connectTimeout;
        private bool $verifySSL;
        private ?string $userAgent;

        public function __construct(string $baseUrl = SUBLY_BASE_URL, array $options = [])
        {
            $this->baseUrl = rtrim($baseUrl, '/');
            $this->timeout = isset($options['timeout']) ? (int)$options['timeout'] : 8;
            $this->connectTimeout = isset($options['connect_timeout']) ? (int)$options['connect_timeout'] : 5;
            $this->verifySSL = array_key_exists('verify_ssl', $options) ? (bool)$options['verify_ssl'] : true;
            $this->userAgent = $options['user_agent'] ?? 'SublyWordPressSDK/1.0 (+https://subly.quan.pro.vn)';
        }

        public function checkByDomain(string $domain): array
        { return $this->request(['domain' => $domain]); }

        public function checkByUUID(string $uuid): array
        { return $this->request(['shop_uuid' => $uuid]); }

        public function isValid(?string $domain = null, ?string $uuid = null): bool
        { return ($this->check($domain, $uuid)['status'] ?? null) === 'valid'; }

        public function check(?string $domain = null, ?string $uuid = null): array
        {
            $params = [];
            if ($uuid) $params['shop_uuid'] = $uuid;
            if ($domain) $params['domain'] = $domain;
            return $this->request($params);
        }

        private function request(array $params): array
        {
            $url = $this->baseUrl . '/api/shops/check';
            $qs = http_build_query($params);
            if ($qs) $url .= '?' . $qs;

            $ch = curl_init($url);
            if ($ch === false) throw new \RuntimeException('curl_init failed');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => $this->connectTimeout,
                CURLOPT_TIMEOUT => $this->timeout,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => $this->verifySSL,
                CURLOPT_HTTPHEADER => ['Accept: application/json'],
                CURLOPT_USERAGENT => $this->userAgent,
            ]);
            $body = curl_exec($ch);
            $errno = curl_errno($ch);
            $err = curl_error($ch);
            $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($errno !== 0) throw new \RuntimeException('cURL error: ' . $err, $errno);
            if ($status >= 400) throw new \RuntimeException('HTTP error ' . $status);
            $data = json_decode((string)$body, true);
            if ($data === null && json_last_error() !== JSON_ERROR_NONE) throw new \RuntimeException('Invalid JSON: ' . json_last_error_msg());
            return $data ?? [];
        }
    }
}

// Helpers (WordPress)
if (!function_exists('shop_check_auto_wp')) {
    function shop_check_auto_wp(array $options = []): array
    {
        // Prefer constant in wp-config.php (SHOP_UUID only)
        $uuid = defined('SHOP_UUID') ? constant('SHOP_UUID') : null;
        if (!$uuid && function_exists('getenv')) {
            $uuid = getenv('SHOP_UUID') ?: null;
        }
        $domain = null;
        if (!$uuid) {
            // derive from home_url() or siteurl
            if (function_exists('home_url')) {
                $u = home_url('/');
                $h = parse_url($u, PHP_URL_HOST);
                if (!empty($h)) $domain = $h;
            }
            if (!$domain && function_exists('get_option')) {
                $u = get_option('siteurl') ?: get_option('home');
                if (!empty($u)) {
                    $h = parse_url($u, PHP_URL_HOST);
                    if (!empty($h)) $domain = $h;
                }
            }
            if (!$domain) {
                $domain = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? null;
            }
        }
        $client = new SublyShopClient(SUBLY_BASE_URL, $options);
        return $client->check($domain, $uuid);
    }
}

if (!function_exists('shop_is_valid_auto_wp')) {
    function shop_is_valid_auto_wp(array $options = []): bool
    { return (shop_check_auto_wp($options)['status'] ?? null) === 'valid'; }
}

if (!function_exists('shop_check_status_wp')) {
    function shop_check_status_wp(?string $domain = null, ?string $uuid = null, array $options = []): array
    { return (new SublyShopClient(SUBLY_BASE_URL, $options))->check($domain, $uuid); }
}

if (!function_exists('shop_is_valid_wp')) {
    function shop_is_valid_wp(?string $domain = null, ?string $uuid = null, array $options = []): bool
    { return (new SublyShopClient(SUBLY_BASE_URL, $options))->isValid($domain, $uuid); }
}
