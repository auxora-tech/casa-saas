# settings/production.py
import os
from django.conf import settings  # Import base settings

DEBUG = False
ALLOWED_HOSTS = [
    'api.gododo.com.au',
    'admin.gododo.com.au',
    'localhost',
    '127.0.0.1',
    # Add ALB DNS name later
]

# PostgreSQL Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'casa_db'),
        'USER': os.environ.get('DB_USER', 'Anjumaster123'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'CasaPass#123'),
        'HOST': os.environ.get('DB_HOST', 'casa-db.cp2qwwo80nb7.ap-southeast-2.rds.amazonaws.com'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'sslmode': 'require',
        },
    }
}

# Static files for production
STATIC_URL = '/static/'
STATIC_ROOT = '/opt/gododo/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = '/opt/gododo/media/'

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://gododo.com.au",
    "https://www.gododo.com.au",
]

# Feature flags
ZOHO_INTEGRATION_ENABLED = os.environ.get(
    'ZOHO_ENABLED', 'False').lower() == 'true'

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
