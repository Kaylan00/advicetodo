.PHONY: up down logs test lint e2e superuser seed

up:
	docker compose up --build -d
	@echo "Front em http://localhost:8080 e API em http://localhost:8000/api/docs/"

down:
	docker compose down -v

logs:
	docker compose logs -f backend

test:
	docker build --quiet --target dev -t advicetodo-backend-dev ./backend
	docker run --rm advicetodo-backend-dev pytest

lint:
	docker build --quiet --target dev -t advicetodo-backend-dev ./backend
	docker run --rm advicetodo-backend-dev ruff check .
	cd web && npm run lint

e2e:
	docker compose up --build -d
	cd e2e && python -m pytest

superuser:
	docker compose exec backend python manage.py createsuperuser

seed:
	docker compose exec backend python manage.py seed_demo
