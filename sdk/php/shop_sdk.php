<?php
/**
 * Lightweight PHP SDK for Subly Shop Expiry Check API
 *
 * Usage (no Composer required):
 *   require_once __DIR__ . '/shop_sdk.php';
 *   $client = new ShopExpiryClient();
 *   $res = $client->checkByDomain('abcshop.vn');
 *   if ($res['status'] === 'valid') 
 *
 * Endpoints used:
 *   GET {BASE}/api/shops/check?domain=... | shop_uuid=...
 */

// Default production base URL (fixed)
if (!defined('SUBLY_BASE_URL')) {
    define('SUBLY_BASE_URL', 'https://subly.quan.pro.vn');
}

class ShopExpiryClient
{
    private string $baseUrl;
    private int $timeout;
    private int $connectTimeout;
    private bool $verifySSL;
    private ?string $userAgent;

    /**
     * @param string $baseUrl Backend base URL (e.g., https://api.example.com)
     * @param array $options  ['timeout'=>8, 'connect_timeout'=>5, 'verify_ssl'=>true, 'user_agent'=>string]
     */
    public function __construct(string $baseUrl = SUBLY_BASE_URL, array $options = [])
    {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->timeout = isset($options['timeout']) ? (int)$options['timeout'] : 8;
        $this->connectTimeout = isset($options['connect_timeout']) ? (int)$options['connect_timeout'] : 5;
        $this->verifySSL = array_key_exists('verify_ssl', $options) ? (bool)$options['verify_ssl'] : true;
        $this->userAgent = $options['user_agent'] ?? 'SublyPHPClient/1.0 (+https://github.com/quan-pro-vn/subly)';
    }

    /**
     * Check by domain
     * @param string $domain
     * @return array Associative array decoded from JSON
     * @throws RuntimeException on HTTP/network/json errors
     */
    public function checkByDomain(string $domain): array
    {
        if ($domain === '') {
            throw new InvalidArgumentException('domain must not be empty');
        }
        return $this->request(['domain' => $domain]);
    }

    /**
     * Check by shop UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
     * @param string $uuid
     * @return array
     */
    public function checkByUUID(string $uuid): array
    {
        if ($uuid === '') {
            throw new InvalidArgumentException('shop_uuid must not be empty');
        }
        return $this->request(['shop_uuid' => $uuid]);
    }

    /**
     * Quick helper: returns true if status is valid
     * @param string|null $domain
     * @param string|null $uuid
     */
    public function isValid(?string $domain = null, ?string $uuid = null): bool
    {
        $res = $this->check($domain, $uuid);
        return isset($res['status']) && $res['status'] === 'valid';
    }

    /**
     * Generic check (provide either $domain or $uuid)
     * @return array
     */
    public function check(?string $domain = null, ?string $uuid = null): array
    {
        if ($domain === null && $uuid === null) {
            throw new InvalidArgumentException('Provide domain or uuid');
        }
        $params = [];
        if ($uuid !== null) { $params['shop_uuid'] = $uuid; }
        if ($domain !== null) { $params['domain'] = $domain; }
        return $this->request($params);
    }

    private function request(array $params): array
    {
        $url = $this->baseUrl . '/api/shops/check';
        $qs = http_build_query($params);
        if ($qs) { $url .= '?' . $qs; }

        $ch = curl_init($url);
        if ($ch === false) {
            throw new RuntimeException('curl_init failed');
        }
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

        if ($errno !== 0) {
            throw new RuntimeException('cURL error: ' . $err, $errno);
        }
        if ($status >= 400) {
            throw new RuntimeException('HTTP error status ' . $status . ' for ' . $url, $status);
        }
        $data = json_decode((string)$body, true);
        if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('Invalid JSON response: ' . json_last_error_msg());
        }
        return $data ?? [];
    }
}

/**
 * Functional helpers for quick use without instantiating the class
 */
if (!function_exists('shop_check_status')) {
    /**
     * @param string $baseUrl
     * @param string|null $domain
     * @param string|null $uuid
     * @param array $options same as ShopExpiryClient ctor options
     */
    function shop_check_status(?string $domain = null, ?string $uuid = null, array $options = []): array
    {
        $c = new ShopExpiryClient(SUBLY_BASE_URL, $options);
        return $c->check($domain, $uuid);
    }
}

if (!function_exists('shop_is_valid')) {
    function shop_is_valid(?string $domain = null, ?string $uuid = null, array $options = []): bool
    {
        $c = new ShopExpiryClient(SUBLY_BASE_URL, $options);
        return $c->isValid($domain, $uuid);
    }
}

// === Laravel-friendly helpers ===
if (!function_exists('shop_check_auto')) {
    /**
     * Auto-detect shop_uuid from env first, otherwise use current request host as domain.
     * Works in Laravel and plain PHP.
     *
     * @param string $baseUrl
     * @param array $options
     * @return array
     */
    function shop_check_auto(array $options = []): array
    {
        $uuid = _shop_env('SHOP_UUID');
        $domain = null;
        if (!$uuid) {
            $domain = _shop_current_host();
        }
        return shop_check_status($domain, $uuid, $options);
    }
}

if (!function_exists('shop_is_valid_auto')) {
    function shop_is_valid_auto(array $options = []): bool
    {
        $res = shop_check_auto($options);
        return isset($res['status']) && $res['status'] === 'valid';
    }
}

// Internal: read env variable (Laravel env() aware)
if (!function_exists('_shop_env')) {
    function _shop_env(string $key): ?string
    {
        // Laravel env()
        if (function_exists('env')) {
            $val = env($key);
            if ($val !== null && $val !== false && $val !== '') return (string)$val;
        }
        // WordPress / plain PHP: defined constant in wp-config.php or elsewhere
        if (defined($key)) {
            $val = constant($key);
            if ($val !== null && $val !== '') return (string)$val;
        }
        // PHP getenv / $_ENV / $_SERVER
        $val = getenv($key);
        if ($val !== false && $val !== '') return (string)$val;
        if (isset($_ENV[$key]) && $_ENV[$key] !== '') return (string)$_ENV[$key];
        if (isset($_SERVER[$key]) && $_SERVER[$key] !== '') return (string)$_SERVER[$key];
        return null;
    }
}

// Internal: detect current host (Laravel Request aware)
if (!function_exists('_shop_current_host')) {
    function _shop_current_host(): ?string
    {
        // Laravel request() helper if available
        if (function_exists('request')) {
            try {
                $req = request();
                if ($req && method_exists($req, 'getHost')) {
                    $host = $req->getHost();
                    if ($host) return _shop_sanitize_host($host);
                }
            } catch (\Throwable $e) {
                // ignore
            }
        }
        // WordPress: derive from home_url if available
        if (function_exists('home_url')) {
            try {
                $u = home_url('/');
                $h = parse_url($u, PHP_URL_HOST);
                if (!empty($h)) return _shop_sanitize_host($h);
            } catch (\Throwable $e) {
                // ignore
            }
        }
        // Fallback to server vars
        $candidates = [
            $_SERVER['HTTP_HOST'] ?? null,
            $_SERVER['SERVER_NAME'] ?? null,
        ];
        foreach ($candidates as $h) {
            if ($h) return _shop_sanitize_host($h);
        }
        return null;
    }
}

if (!function_exists('_shop_sanitize_host')) {
    function _shop_sanitize_host(string $host): string
    {
        // strip port and spaces
        $h = trim($host);
        // remove protocol if accidentally included
        $h = preg_replace('#^https?://#i', '', $h);
        // take until first slash
        $h = explode('/', $h, 2)[0];
        // drop port
        $h = explode(':', $h, 2)[0];
        return $h;
    }
}
