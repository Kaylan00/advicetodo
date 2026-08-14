FROM python:3.12-slim AS base

LABEL org.opencontainers.image.source="https://github.com/Kaylan00/advicetodo"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DJANGO_SETTINGS_MODULE=config.settings

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Imagem usada para rodar a suite de testes (make test e CI).
FROM base AS dev

RUN pip install --no-cache-dir -r requirements-dev.txt
CMD ["pytest"]

FROM base AS prod

RUN python manage.py collectstatic --noinput \
    && useradd --system --create-home app \
    && chown -R app:app /app

USER app
EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--access-logfile", "-"]
