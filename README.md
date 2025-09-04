
# Docker Compose Setup

This repository provides a frontend, backend, and MySQL database orchestrated via Docker Compose.

## Services

- frontend: Nginx serves built static files on port 80. Requests to `/api` are proxied to the backend by Nginx (see `frontend/nginx.conf`).
- backend: Go API on port 8080. Reads `DATABASE_DSN` for DB connection.
- db: MySQL 8.0 for the backend, credentials `gorm:gorm`, database `gorm`.

## Networking

- `internal-net` (bridge, internal: true): private network for communication among `frontend`, `backend`, and `db`.
- `tinker-net` (external): only the `frontend` service joins this network so it can be reached by your reverse proxy.

Ports are not published by default. Access is expected via a reverse proxy attached to `tinker-net` that routes to `frontend:80`.

## Usage

1. Ensure Docker and Docker Compose are installed.
2. Ensure the external network exists once on the host:

   ```bash
   docker network create tinker-net
   ```

3. Build and start the stack:

   ```bash
   docker compose up -d --build
   ```

4. Attach your reverse proxy (Nginx/Traefik/NGINX Proxy Manager) to `tinker-net` and route traffic to `frontend:80`.

5. Stop and remove the stack:

   ```bash
   docker compose down
   ```

For local development exposing ports directly, see `docker-compose.dev.yml` or create a `docker-compose.override.yml` to publish desired ports.
