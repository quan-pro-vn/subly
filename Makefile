prepare:
	docker network create tinker-net

build:
	docker compose up -d --build
	docker compose ps

# Run with dev override (frontend port exposed)
dev:
	docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	docker compose -f docker-compose.yml -f docker-compose.dev.yml ps

