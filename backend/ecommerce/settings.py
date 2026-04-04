

"""
Django settings for ecommerce project.
"""

from pathlib import Path
import os
from datetime import timedelta

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# ===============================
# CORE SETTINGS
# ===============================
SECRET_KEY = "django-insecure-^-v)lg^lc+m0dp80%3ckzazj_x0!wobyyj6wc%(f4c!7+b@a3@"

DEBUG = False

# ONLY this is dynamic from env
ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "thefoodpark.xyz,www.thefoodpark.xyz,31.97.71.239,localhost,127.0.0.1"
).split(",")
CSRF_TRUSTED_ORIGINS = [
    "https://swiftstorefront.com",
    "https://www.swiftstorefront.com",
    "https://api.swiftstorefront.com",
]

# ===============================
# APPLICATIONS
# ===============================

INSTALLED_APPS = [
    "corsheaders",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "djoser",
    "django_filters",
    "api",
]

# ===============================
# MIDDLEWARE
# ===============================

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ===============================
# URL / WSGI
# ===============================

ROOT_URLCONF = "ecommerce.urls"
WSGI_APPLICATION = "ecommerce.wsgi.application"

# ===============================
# TEMPLATES
# ===============================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ===============================
# DATABASE (SQLite inside image)
# ===============================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ===============================
# PASSWORD VALIDATION
# ===============================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# ===============================
# INTERNATIONALIZATION
# ===============================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Dhaka"

USE_I18N = True
USE_TZ = False

# ===============================
# STATIC FILES (inside image)
# ===============================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ===============================
# MEDIA FILES (inside image)
# ===============================

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ===============================
# DEFAULT FIELD
# ===============================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ===============================
# CORS
# ===============================

CORS_ALLOW_ALL_ORIGINS = True

# ===============================
# REST FRAMEWORK
# ===============================

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend"
    ],
}

# ===============================
# DJOSER
# ===============================

DJOSER = {
    "USER_ID_FIELD": "username",
    "LOGIN_FIELD": "email",
}

# ===============================
# USER GROUPS
# ===============================

USER_GROUPS = {
    "superuser": "Superuser",
    "editor": "Editor",
    "customer": "Customer",
}

# ===============================
# FACEBOOK (kept inside image)
# ===============================

FACEBOOK_PIXEL_ID = '1154715702730044'  # Replace with your actual pixel ID
FACEBOOK_ACCESS_TOKEN = 'EAAKZCZC9iWNKgBOznzAUUaOBvN3kE4ZCfRH8loYTkVtAMqlw3RURPB2H6vm6ZBslfy1OKlvhg01ZCzruYDbalnL9k7Te2625we0ZCzVWUvUakGD01OVhKuwpVB2dkZBuzY6t4iJZBQZCHEmhn6aM3HK6FCZBiG7DQaKxcESaCf09ZBX2ek3vWD6LgwkQituSz7cjNZCecQZDZD'  # Replace with your CAPI access token
FACEBOOK_TEST_EVENT_CODE = "TEST46436"  # Set to your test code when testing
