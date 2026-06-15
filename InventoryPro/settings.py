import os
from pathlib import Path
from dotenv import load_dotenv  # Asegúrate de tener esta línea

# --- CARGAR VARIABLES DE ENTORNO ---
load_dotenv()  # Esto lee el archivo .env que creaste

# --- BASE DIRECTORY ---
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SEGURIDAD ---
# Ahora usamos os.getenv para jalar los datos del .env
SECRET_KEY = os.getenv("SECRET_KEY")

# DEBUG ahora es dinámico (se vuelve False automáticamente si en el .env pones False)
DEBUG = os.getenv("DEBUG", "True") == "True"

# ALLOWED_HOSTS se convierte en lista automáticamente
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

# --- APPS ---
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "inventory.apps.InventoryConfig",
    "rest_framework",
]

# --- MIDDLEWARE (Obligatorio para que funcione el servidor) ---
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "InventoryPro.urls" # Asegúrate que este nombre coincida con tu carpeta principal

# --- BASE DE DATOS (Obligatorio) ---
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# --- REST FRAMEWORK ---
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
}

# --- OTROS AJUSTES ---
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "frontend" / "build"],
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

WSGI_APPLICATION = "InventoryPro.wsgi.application"
STATIC_URL = "/static/"
STATICFILES_DIRS = [
    BASE_DIR / "frontend" / "build" / "static",
]
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # Agrega esta línea
    "http://127.0.0.1:3001",  # También esta por seguridad
]