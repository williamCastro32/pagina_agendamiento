# Un solo contenedor: Django sirve la API y también la SPA ya compilada.
# El frontend se construye en una etapa aparte para que Node no acabe en la
# imagen final — sólo viaja la carpeta dist/.

# ---------------------------------------------------------------- frontend ---
FROM node:24-alpine AS frontend

WORKDIR /app/frontend

# package*.json primero: mientras no cambien, Docker reutiliza la capa de
# npm ci y no vuelve a descargar nada.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ----------------------------------------------------------------- backend ---
FROM python:3.12-slim AS backend

# PYTHONUNBUFFERED: sin esto los logs se quedan en el buffer y no aparecen en
# los logs de Railway hasta que el proceso muere.
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt backend/requirements-prod.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements-prod.txt

COPY backend/ ./backend/

# La ruta debe coincidir con FRONTEND_DIST en settings.py: <raíz>/frontend/dist
COPY --from=frontend /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

# Los estáticos del admin de Django. Falla el build si algo va mal, en vez de
# descubrirlo con un admin sin estilos en producción.
# SECRET_KEY de relleno: collectstatic carga settings pero no firma nada.
RUN SECRET_KEY=build-time-placeholder-value-not-used-for-signing \
    DEBUG=False \
    SECURE_SSL_REDIRECT=False \
    python manage.py collectstatic --noinput

EXPOSE 8000

# Railway inyecta $PORT. El fallback a 8000 es para `docker run` en local.
# Las migraciones van aquí y no en el build porque en build no hay base de datos.
CMD python manage.py migrate --noinput && \
    python manage.py ensure_superuser && \
    gunicorn core.wsgi:application \
      --bind "0.0.0.0:${PORT:-8000}" \
      --workers 3 \
      --timeout 60 \
      --access-logfile - \
      --error-logfile -
