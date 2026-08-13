#!/bin/sh
set -e

# O banco sobe junto, entao a migracao roda a cada start do container.
python manage.py migrate --noinput

exec "$@"
