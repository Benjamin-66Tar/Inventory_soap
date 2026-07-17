#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "=== Instalando dependencias de Python ==="
pip install -r requirements.txt

echo "=== Instalando y compilando React Frontend ==="
npm install --prefix frontend
CI=false npm run build --prefix frontend

echo "=== Recopilando archivos estáticos de Django ==="
python manage.py collectstatic --no-input

echo "=== Aplicando migraciones de la base de datos ==="
python manage.py migrate
