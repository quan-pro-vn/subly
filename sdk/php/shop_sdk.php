<?php
/**
 * Lightweight PHP SDK for Subly Shop Expiry Check API
 *
 * Usage (no Composer required):
 *   require_once __DIR__ . '/shop_sdk.php';
 *   $client = new ShopExpiryClient('https://your-backend-host');
 *   $res = $client->checkByDomain('abcshop.vn');
 *   if ($res['status'] === 'valid') 
 *
 * Endpoints used:
 *   GET {BASE}/api/shops/check?domain=... | shop_uuid=...
 */

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
    public function __construct(string $baseUrl, array $options = [])
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
    function shop_check_status(string $baseUrl, ?string $domain = null, ?string $uuid = null, array $options = []): array
    {
        $c = new ShopExpiryClient($baseUrl, $options);
        return $c->check($domain, $uuid);
    }
}

if (!function_exists('shop_is_valid')) {
    function shop_is_valid(string $baseUrl, ?string $domain = null, ?string $uuid = null, array $options = []): bool
    {
        $c = new ShopExpiryClient($baseUrl, $options);
        return $c->isValid($domain, $uuid);
    }
}

