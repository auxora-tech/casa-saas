from datetime import timedelta
from pathlib import Path
import dj_database_url
from decouple import config  # type:ignore
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-@9jg_+k3rscm=a@pi#=_ukobwc2_p0@c%^_!homx17fwk@45qr'
DJANGO_SECRET_KEY_PRODUCTION = '3q8j8&b_%04dih^%_o00dylg+ii_b&vhpk(c1dx@9o2(y@0kte'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost','9cb1a0906215.ngrok-free.app', '733f2e6e2412.ngrok-free.app',
                 'http://localhost:5173/', '127.0.0.1', 'gododo-backend.onrender.com', 'localhost', 'gododo.com.au']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'apps.user',
    'apps.authentication',
    'apps.company',
    'apps.membership',
    'apps.participant',
    'apps.employee',
    'apps.document',
    'apps.onboarding',
    'phonenumber_field',
    # 'magiclink',
]

MIDDLEWARE = [
    # 'allauth.account.middleware.AccountMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
# For development only - allows all origins
CORS_ALLOW_ALL_ORIGINS = True

# For PRODUCTION - specify exact origins
# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     "http://127.0.0.1:3000",
#     "https://your-production-domain.com",
# ]

# Optional: Allow specific subdomains
# CORS_ALLOWED_ORIGIN_REGEXES = [
#     r"^https://\w+\.your-domain\.com$",
# ]

# Allow credentials for (JWT tokens)
CORS_ALLOW_CREDENTIALS = True

# Allowed headers (Important for JWT)
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with'
]

# Allowed methods
CORS_ALLOWED_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# For JWT tokens in headers
CORS_EXPOSE_HEADERS = [
    'authorization'
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

ROOT_URLCONF = 'backend.urls'

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

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# Database configuration for Render
if 'DATABASE_URL' in os.environ:
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    }
else:
    # Your existing SQLite config for local development
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }


SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,  # generate new refresh token
    'BLACKLIST_AFTER_ROTATION': True, # blacklist old refresh token
}

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR/'media'

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators


AUTH_USER_MODEL = 'user.User_Model'
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' # for dev/testing


AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = (
    'apps.user.backends.EmailAuthBackend',
    'django.contrib.auth.backends.ModelBackend',
)

# Email Backend (Development)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # logs to console

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

DEFAULT_COMPANY = {
    'title': 'Casa Community Pty Ltd',
    'no_of_employees':  '1-10',
    'country': 'Australia',
    'address': '586 Port Rd, Allenby Gardens, SA 5009',
    'is_active': True
}

# Gmail SMTP (Simplest for testing)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default = '')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = 'taufeeqyouth@gmail.com'

# Admin notification settings
ADMIN_EMAIL = config('ADMIN_EMAIL')
NOTIFICATION_EMAILS = [
    'casacommunityau@gmail.com',
]

# Zoho setting
ZOHO_CLIENT_ID = config('ZOHO_CLIENT_ID')
ZOHO_CLIENT_SECRET = config('ZOHO_CLIENT_SECRET')
ZOHO_REDIRECT_URI = config('ZOHO_REDIRECT_URI')
ZOHO_ENVIRONMENT = config('ZOHO_ENVIRONMENT', default='production')
ZOHO_SCOPE = config('ZOHO_SCOPE')

# Zoho API URLs
ZOHO_ACCOUNTS_URL = config('ZOHO_ACCOUNTS_URL')
ZOHO_SIGN_API_URL = config('ZOHO_SIGN_API_URL')
ZOHO_WEBHOOK_SECRET = config('ZOHO_WEBHOOK_SECRET')
ZOHO_SERVICE_AGREEMENT_TEMPLATE_ID = config('ZOHO_SERVICE_AGREEMENT_TEMPLATE_ID')

# Cache settings for tokens (if not already configured)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
        'TIMEOUT': 3600,  # 1 hour
        'OPTIONS': {
            'MAX_ENTRIES': 1000,
            'CULL_FREQUENCY': 3,
        }
    }
}

# Template Action IDs from your Zoho template
ZOHO_TEMPLATE_ACTION_IDS = {
    'CASA_REP': '102698000000040534',  # Casa Community Representative
    'CLIENT': '102698000000040536',    # Client
    'GUARDIAN': '102698000000040538'   # Client Guardian/Representative
}

# Browsers have a security rule: "A website can only talk to servers on the same domain/port by default."
# Since your React app(port 3000) and Django API(port 8000) are on different ports, the browser says "NOPE! This looks suspicious, I won't allow it!"
# What CORS Does:
# CORS is like a permission slip that your Django server gives to the browser saying:
# "Hey browser, it's totally fine for websites from localhost:3000 to talk to me. I trust them!"
