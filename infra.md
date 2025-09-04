# Hạ tầng & Vận hành (infra)

Tài liệu mô tả kiến trúc dịch vụ, biến môi trường, mạng Docker, quy trình build/run, reverse proxy, sao lưu và xử lý sự cố cho dự án này.

## Kiến trúc
- frontend: React (Vite) build sẵn, phục vụ bởi nginx nội bộ container (cổng 80). Proxy mọi yêu cầu có tiền tố `/api` sang backend qua mạng Docker.
- backend: Go (Gin) lắng nghe `:8080`. Đọc DSN từ `DATABASE_DSN`. Tự động migrate schema với GORM khi khởi động.
- db: MySQL 8.0, dữ liệu lưu ở volume `db-data`, có healthcheck trước khi backend khởi chạy.
- Mạng: Dùng hai mạng Docker:
  - `internal-net` (bridge, `internal: true`) cho giao tiếp nội bộ giữa `frontend` ↔ `backend` ↔ `db`.
  - `tinker-net` (external) chỉ gắn cho `frontend` để reverse proxy của hệ thống có thể truy cập.

Luồng truy cập: Client → (Reverse Proxy) → frontend (nginx) → /api → backend → db.

## Yêu cầu hệ thống
- Docker 24+ và Docker Compose v2.
- Mạng ngoài cho stack: chạy một lần `docker network create tinker-net` trên host.

## Endpoint sức khỏe
- `GET /ping`: backend trả `{ "message": "pong" }`.
- `GET /api/health`: trả `{ "status": "ok" }` khi router auth được mount.

## Biến môi trường
- `DATABASE_DSN`: DSN MySQL cho backend. Mặc định trong `docker-compose.yml`: `gorm:gorm@tcp(db:3306)/gorm?charset=utf8&parseTime=True&loc=Local`.
- `CLIENT_ORIGIN` (tùy chọn): Origin cho CORS, mặc định `*` (đang bật AllowAllOrigins trong backend).
- `AUTH_RATE_LIMIT` (tùy chọn): Số request/phút mỗi IP. Middleware có sẵn nhưng CHƯA bật mặc định trên các route; chỉ hiệu lực nếu được gắn vào router trong code.
- `.env` ở root có thể ghi các cổng dev (`BACKEND_PORT`, `FRONTEND_PORT`, `DB_PORT`) khi dùng override để publish port ra ngoài.
- Frontend `.env`: `VITE_APP_NAME`, `VITE_APP_VERSION` dùng lúc build giao diện.

## Chạy cục bộ
- Phương án A – Reverse proxy nội bộ (khuyến nghị đồng nhất với production)
  - Tạo mạng: `docker network create tinker-net` (nếu chưa có).
  - Khởi chạy: `docker compose up -d --build`.
  - Đảm bảo reverse proxy (Nginx/Traefik/NGPM) join mạng `tinker-net` và upstream tới `frontend:80`.

- Phương án B – Mở port trực tiếp (dev nhanh)
  - Tạo `docker-compose.override.yml` (không bắt buộc commit):
    ```yaml
    services:
      frontend:
        ports:
          - "${FRONTEND_PORT:-8084}:80"
      backend:
        ports:
          - "${BACKEND_PORT:-8083}:8080"
      db:
        ports:
          - "${DB_PORT:-3307}:3306"
    ```
  - Chạy: `docker compose up -d --build` và truy cập:
    - Frontend: http://localhost:${FRONTEND_PORT}
    - Backend: http://localhost:${BACKEND_PORT}
    - MySQL: localhost:${DB_PORT} (user: gorm, pass: gorm, db: gorm)

## Reverse proxy mẫu (nginx)
Ví dụ khi reverse proxy cùng mạng Docker `tinker-net` cho domain `quanlv.tinker.vn`:
```nginx
upstream app_frontend { server frontend:80; }
server {
  listen 80; server_name quanlv.tinker.vn;
  location / { proxy_pass http://app_frontend; }
}
```
Lưu ý: Proxy tới `frontend:80` trên `tinker-net`. Tuyến `/api` đã được `frontend/nginx.conf` chuyển tiếp sang `backend:8080` qua mạng nội bộ `internal-net`.

## Dữ liệu & migration
- Backend gọi AutoMigrate cho bảng Users và Tokens (xem `backend/internal/database/database.go`).
- Dữ liệu MySQL lưu tại volume `db-data` (được khai báo trong Compose).

## Sao lưu / Phục hồi MySQL
- Sao lưu toàn bộ DB `gorm`:
  - `docker compose exec db sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" gorm' > backup.sql`
- Phục hồi (ghi đè DB `gorm`):
  - `docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" gorm' < backup.sql`

## Vận hành thường ngày
- Build & chạy: `make build` hoặc `docker compose up -d --build`.
- Dừng: `docker compose down`.
- Nhật ký:
  - Backend: `docker compose logs -f backend`
  - Frontend: `docker compose logs -f frontend`
  - DB: `docker compose logs -f db`
- Kiểm tra health DB: `docker inspect --format='{{json .State.Health}}' $(docker compose ps -q db)`

## Triển khai & mở rộng
- Kết nối reverse proxy có TLS (Let's Encrypt) vào `frontend:80` trên mạng `tinker-net`.
- Có thể scale frontend/backend (stateless) cho mục đích đọc/CPU:
  - Ví dụ: `docker compose up -d --scale frontend=2 --no-recreate`.
  - Lưu ý: Cần reverse proxy cân bằng tải theo container.

## Bảo mật
- Không commit `.env` có bí mật; dùng secret của CI/CD hoặc biến env trên host.
- Hạn chế publish port; ưu tiên expose qua reverse proxy có TLS + firewall.
- Sao lưu định kỳ volume `db-data` và lưu bản sao ngoại vi (offsite).

## Khác biệt với README.md
- `README.md` mô tả mạng `app-network` và publish port mặc định. Cấu hình hiện tại dùng `internal-net` (riêng tư) và `tinker-net` (chỉ cho frontend, phục vụ reverse proxy). Dùng phần “Chạy cục bộ” để chọn mô hình phù hợp.

## Xử lý sự cố (Troubleshooting)
- Frontend/Backend không truy cập được tên service: Kiểm tra `internal-net` tồn tại và cả ba dịch vụ đã gắn vào; `frontend` phải đồng thời ở `internal-net` và `tinker-net`.
- Backend không kết nối được MySQL: Chờ DB healthy; xem log `docker compose logs -f db`. Kiểm tra `DATABASE_DSN` đúng host `db:3306` trong mạng Docker.
- 502 từ reverse proxy: Kiểm tra reverse proxy có join mạng `tinker-net` và upstream trỏ `frontend:80` đúng tên dịch vụ Compose.
- Cổng dev không lên khi dùng override: Đảm bảo giá trị trong `.env` root không bị trùng port đang dùng trên host.
