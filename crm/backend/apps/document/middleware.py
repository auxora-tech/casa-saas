# apps/documents/middleware.py
from django.core.cache import cache
from django.utils.deprecation import MiddlewareMixin
from .zoho_sign import ZohoSignService
import logging

logger = logging.getLogger(__name__)


class ZohoTokenRefreshMiddleware(MiddlewareMixin):
    """
    Middleware to automatically refresh Zoho tokens when they're about to expire.
    This runs periodically to ensure tokens stay valid.
    """

    def process_request(self, request):
        # Only check token status on Zoho-related endpoints
        if '/zoho/' in request.path or '/documents/' in request.path:
            try:
                # Check if token exists and is valid
                token = cache.get('zoho_access_token')
                if not token:
                    # Try to refresh token silently
                    zoho_service = ZohoSignService()
                    zoho_service.get_valid_token()
                    logger.info("Zoho token refreshed automatically")

            except Exception as e:
                # Don't break the request if token refresh fails
                logger.warning(f"Failed to refresh Zoho token: {e}")

        return None
