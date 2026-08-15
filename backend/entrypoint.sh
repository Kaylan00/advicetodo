#!/bin/sh
set -e

# O banco sobe junto, entao a migracao roda a cada start do container.
python manage.py migrate --noinput

# Ambiente de demonstracao: o comando e idempotente, entao repetir o start nao duplica nada.
if [ "${SEED_DEMO:-0}" = "1" ]; then
  python manage.py seed_demo
fi

exec "$@"
