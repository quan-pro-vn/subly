# Hạ tầng & Vận hành (infra)

Tài liệu mô tả kiến trúc, biến môi trường, mạng Docker, quy trình build/run, giám sát và sao lưu cho dự án này.

## Kiến trúc
- **frontend**: Ứng dụng React build bằng Vite, phục vụ bởi `nginx` (container lắng nghe cổng nội bộ `80`). Proxy các yêu cầu `/api` tới backend qua mạng nội bộ Docker.
- **backend**: API viết bằng Go (Gin) lắng nghe `:8080`. Đọc cấu hình DB từ `DATABASE_DSN`. Tự động migrate schema bằng GORM khi khởi động.
- **db**: MySQL 8.0, dữ liệu lưu vào volume `db-data`. Có healthcheck đảm bảo sẵn sàng trước khi backend khởi động.
- **Mạng**: Tất cả service tham gia vào mạng Docker ngoài `tinker-net` (external). Dùng để tích hợp với reverse proxy/nginx bên ngoài stack.

Sơ đồ lưu thông: `Client → (Reverse Proxy) → frontend (nginx) → /api → backend → db`.

## Yêu cầu hệ thống
- Docker 24+ và Docker Compose v2.
- Đã tạo mạng ngoài cho Compose: `docker network create tinker-net` (chạy một lần trên host).

## Biến môi trường
- `DATABASE_DSN`: DSN MySQL cho backend. Mặc định trong `docker-compose.yml` là `gorm:gorm@tcp(db:3306)/gorm?charset=utf8&parseTime=True&loc=Local`.
- `AUTH_RATE_LIMIT` (tùy chọn): Giới hạn request/phút mỗi IP cho các route auth. Mặc định `5`.
- `CLIENT_ORIGIN` (tùy chọn): Nguồn CORS phía client, mặc định `*`.
- File `.env` ở root có thể chứa các port gợi ý cho môi trường dev (`BACKEND_PORT`, `FRONTEND_PORT`, `DB_PORT`) nhưng hiện đang không được publish trong `docker-compose.yml` (để sẵn sàng cho mô hình reverse proxy).

## Chạy cục bộ (2 lựa chọn)
- **A. Cùng reverse proxy nội bộ (khuyên dùng production/dev đồng nhất)**
  - Tạo mạng `tinker-net` nếu chưa có: `docker network create tinker-net`.
  - Khởi chạy: `docker compose up -d --build`.
  - Truy cập thông qua reverse proxy của bạn (ví dụ Nginx Proxy Manager, Traefik) trỏ vào `frontend:80` trên mạng `tinker-net`.

- **B. Mở port trực tiếp (dev nhanh)**
  - Tạo file `docker-compose.override.yml` (không commit nếu không cần):
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
    - Frontend: `http://localhost:${FRONTEND_PORT}`
    - Backend: `http://localhost:${BACKEND_PORT}`
    - MySQL: `localhost:${DB_PORT}` (user: `gorm`, pass: `gorm`, db: `gorm`)

## Reverse proxy mẫu (nginx)
Ví dụ cấu hình server cho domain `quanlv.tinker.vn` khi reverse proxy cùng mạng Docker `tinker-net`:
```nginx
upstream app_frontend { server frontend:80; }
server {
  listen 80; server_name quanlv.tinker.vn;
  location / { proxy_pass http://app_frontend; }
}
```
Lưu ý: proxy tới `frontend:80`. Tuyến `/api` đã được `frontend/nginx.conf` proxy nội bộ sang `backend:8080`.

## Dữ liệu & Migration
- Backend tự `AutoMigrate` các bảng (Users, Tokens) lúc khởi động (xem `backend/internal/database/database.go`).
- Dữ liệu MySQL nằm trong volume `db-data`.

## Sao lưu/Phục hồi MySQL
- Sao lưu:
  - `docker compose exec db sh -c 'mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" gorm' > backup.sql`
- Phục hồi (xóa/ghi đè DB `gorm`):
  - `docker compose exec -T db sh -c 'mysql -u root -p"$MYSQL_ROOT_PASSWORD" gorm' < backup.sql`

## Vận hành
- Build & chạy: `make build` hoặc `docker compose up -d --build`.
- Dừng: `docker compose down`.
- Nhật ký:
  - Backend: `docker compose logs -f backend`
  - Frontend: `docker compose logs -f frontend`
  - DB: `docker compose logs -f db`
- Kiểm tra health DB: `docker inspect --format='{{json .State.Health}}' $(docker compose ps -q db)`

## Bảo mật & Best practices
- Không commit file `.env` chứa thông tin nhạy cảm.
- Xoay vòng mật khẩu DB/secret định kỳ; dùng biến môi trường bí mật khi deploy CI/CD.
- Hạn chế publish port ra internet; ưu tiên reverse proxy có TLS (Let's Encrypt) và tường lửa.
- Sao lưu định kỳ volume `db-data` và giữ snapshot ngoài máy chủ.

## Khác biệt với README.md
`README.md` mô tả mạng `app-network` và publish port. Cấu hình thực tế trong repo dùng mạng ngoài `tinker-net` và không publish port mặc định. Dùng phần “Chạy cục bộ” bên trên để chọn mô hình phù hợp.

