<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PackageService
{
    // Thời gian cache (giây)
    protected int $ttl = 60;

    // Endpoint kiểm tra hạn (cố định)
    protected string $endpoint = 'https://subly.quan.pro.vn/api/shops/check';

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     */
    public function handle($request, Closure $next)
    {
        $uuid = env('SHOP_UUID');
        $domain = $uuid ? null : $this->currentHost($request);

        // Cache key theo UUID/host
        $cacheKey = $this->makeCacheKey($uuid, $domain);

        $available = Cache::remember($cacheKey, $this->ttl, function () use ($uuid, $domain) {
            return $this->checkAvailable($uuid, $domain);
        });

        if ($available === true) {
            return $next($request);
        }

        // Hết hạn hoặc lỗi kiểm tra
        if ($request->expectsJson()) {
            return response()->json([
                'error' => 'shop_expired',
                'message' => 'Website đã hết hạn.',
            ], 402);
        }

        // Giữ hành vi quen thuộc: render errors.503
        return response()->view('errors.503', [], 503);
    }

    /**
     * Gọi API kiểm tra hạn, trả về true nếu còn hạn.
     */
    private function checkAvailable(?string $uuid, ?string $domain): bool
    {
        try {
            $params = [];
            if ($uuid) {
                $params['shop_uuid'] = $uuid;
            } elseif ($domain) {
                $params['domain'] = $domain;
            } else {
                // Không có thông tin, coi như hết hạn
                return false;
            }

            $res = Http::acceptJson()
                ->connectTimeout(3)
                ->timeout(5)
                ->get($this->endpoint, $params);

            if (!$res->ok()) {
                Log::warning('Subly check: HTTP error', ['status' => $res->status(), 'params' => $params]);
                return false;
            }

            $data = $res->json();
            // Hợp lệ khi status === 'valid'
            return isset($data['status']) && $data['status'] === 'valid';
        } catch (\Throwable $e) {
            Log::warning('Subly check: exception', ['err' => $e->getMessage()]);
            // Chính sách fail-closed: coi như không khả dụng
            return false;
        }
    }

    private function makeCacheKey(?string $uuid, ?string $domain): string
    {
        if (!empty($uuid)) {
            return 'subly:expiry:uuid:' . $uuid;
        }
        return 'subly:expiry:host:' . ($domain ?? 'unknown');
    }

    private function currentHost(Request $request): ?string
    {
        $host = $request->getHost();
        if (!$host) return null;

        // sanitize đơn giản (bỏ port)
        $parts = explode(':', trim($host), 2);
        return $parts[0];
    }
}
