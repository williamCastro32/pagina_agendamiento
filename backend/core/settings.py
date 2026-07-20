"""Django settings for the booking-site backend."""

from datetime import timedelta
from pathlib import Path

import dj_database_url
from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parent.parent

# The Vite build output. Django serves it in production so the whole site lives
# on one origin and api.js can keep its relative '/api' base.
FRONTEND_DIST = BASE_DIR.parent / 'frontend' / 'dist'

# Must be >= 32 bytes: SimpleJWT signs tokens with HS256 off this key.
SECRET_KEY = config(
    'SECRET_KEY',
    default='dev-only-insecure-key-change-me-before-deploying-anywhere',
)
# Set by Railway on every service. Used as "are we deployed?" so a buyer who
# forgets to set DEBUG does not get a debug-mode site on a public URL.
ON_RAILWAY = bool(config('RAILWAY_ENVIRONMENT', default=''))

DEBUG = config('DEBUG', default=not ON_RAILWAY, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# Railway injects the generated domain here — but only once a domain exists.
RAILWAY_DOMAIN = config('RAILWAY_PUBLIC_DOMAIN', default='')
if RAILWAY_DOMAIN:
    ALLOWED_HOSTS.append(RAILWAY_DOMAIN)

if ON_RAILWAY:
    # The healthcheck runs *before* any domain is generated, and it does not
    # arrive with the public Host header. Without these a first deploy fails
    # with DisallowedHost and never becomes healthy — which is exactly what
    # happened on the first attempt here. Leading dots are Django's
    # subdomain-wildcard syntax.
    ALLOWED_HOSTS += ['.up.railway.app', '.railway.app', '.railway.internal']

# Django 4+ checks Origin against this on every unsafe request, so the Django
# admin login fails behind Railway's TLS proxy without it.
CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='', cast=Csv())
if RAILWAY_DOMAIN:
    CSRF_TRUSTED_ORIGINS.append(f'https://{RAILWAY_DOMAIN}')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'site_api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    # Directly below SecurityMiddleware, as WhiteNoise requires.
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Railway's Postgres plugin exports DATABASE_URL; without it we stay on the
# local SQLite file, so development needs no database setup at all.
DATABASES = {
    'default': dj_database_url.config(
        default=f'sqlite:///{BASE_DIR / "db.sqlite3"}',
        conn_max_age=600,
        conn_health_checks=True,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'es'
TIME_ZONE = config('TIME_ZONE', default='UTC')
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Two separate trees, deliberately:
#   STATIC_ROOT     Django's own assets (the admin CSS), served under /static/
#   WHITENOISE_ROOT frontend/dist, served at the site root so the hashed paths
#                   baked into index.html (/assets/index-*.js) resolve as-is
# WHITENOISE_INDEX_FILE makes '/' return index.html, which is the only entry
# point the SPA has — App.jsx switches screens in state, there are no URLs.
if FRONTEND_DIST.is_dir():
    WHITENOISE_ROOT = FRONTEND_DIST
    WHITENOISE_INDEX_FILE = True

# In development WhiteNoise looks files up per request instead of indexing them
# at startup, so a rebuild shows up without restarting Django — and it stops
# warning about staticfiles/, which only exists after collectstatic.
WHITENOISE_AUTOREFRESH = DEBUG

STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {
        # Hashes and compresses on collectstatic so the admin assets can be
        # cached forever. Not ManifestStaticFilesStorage: that one raises on any
        # asset it can't find in the manifest, and the SPA's files are not in it.
        'BACKEND': 'whitenoise.storage.CompressedStaticFilesStorage',
    },
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Railway terminates TLS at its proxy, so Django only ever sees plain HTTP and
# would otherwise redirect forever. These are no-ops when DEBUG is on.
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

    # Off by default on Railway, on by default anywhere else. Railway's edge
    # already terminates TLS and serves the public URL over HTTPS, while its
    # healthcheck reaches the container over plain HTTP *without*
    # X-Forwarded-Proto. Redirecting here would 301 the healthcheck and the
    # deploy would never go green.
    SECURE_SSL_REDIRECT = config(
        'SECURE_SSL_REDIRECT', default=not ON_RAILWAY, cast=bool
    )
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    # Off by default, and deliberately so. HSTS tells browsers to refuse plain
    # HTTP for this host for the whole duration, and they cache that: if TLS
    # ever lapses on a custom domain the site is unreachable until it expires.
    # Worth turning on (31536000 = a year) once the domain is settled.
    SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=0, cast=int)
    if SECURE_HSTS_SECONDS:
        SECURE_HSTS_INCLUDE_SUBDOMAINS = True
        SECURE_HSTS_PRELOAD = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        # Booking creation is the only unauthenticated write path.
        'anon': '60/hour',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# The Vite dev server; in production the frontend is built and served separately.
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://127.0.0.1:5173',
    cast=Csv(),
)

# How many days ahead the booking calendar offers.
BOOKING_DAYS_AHEAD = config('BOOKING_DAYS_AHEAD', default=7, cast=int)
