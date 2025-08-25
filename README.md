# Docker Compose Setup

This repository provides a simple frontend, backend, and MySQL database that can be run together using Docker Compose.

## Services

- **frontend** – builds from `frontend/Dockerfile` and serves the web UI on port **80**. Requests to `/api` are proxied to the backend container.
- **backend** – builds from `backend/Dockerfile` and exposes an API on port **8080**. It reads the `DATABASE_DSN` environment variable for the database connection.
- **db** – MySQL instance used by the backend with credentials `gorm:gorm` and database `gorm`.

All services share the `app-network` network so they can reach each other by container name.

## Usage

1. Ensure Docker and Docker Compose are installed.
2. From the repository root, build and start the stack:

   ```bash
   docker compose up --build
   ```

   - Frontend available at http://localhost
   - Backend API at http://localhost:8080
   - Database exposed on port 3306 (connection DSN: `gorm:gorm@tcp(localhost:3306)/gorm?charset=utf8&parseTime=True&loc=Local`)

3. To stop and remove the containers:

   ```bash
   docker compose down
   ```
