# Full Stack Development Environment

## Prerequisites
- [Docker](https://www.docker.com/)
- [docker-compose](https://docs.docker.com/compose/)

## Building and Running
Build and start the full stack:

```sh
docker compose up --build
```

## Environment Variables
These variables may be set in a `.env` file or exported in your shell before running the stack.

- `VITE_BASE_URL` &ndash; base path used by the frontend during build time (defaults to `/`).
- `FRONTEND_PORT` &ndash; port exposed for the frontend web server (defaults to `80`).
- `BACKEND_PORT` &ndash; port exposed for the backend API (defaults to `8080`).

## Accessing the Services
Once all containers are up:

- Frontend: <http://localhost> (or <http://localhost:${FRONTEND_PORT}> if changed)
- Backend API: <http://localhost:8080> (or <http://localhost:${BACKEND_PORT}> if changed)

