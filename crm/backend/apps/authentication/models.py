# import secrets
# import hashlib
# from datetime import timedelta
# from django.db import models
# from django.utils import timezone
# from django.conf import settings

# # Create your views here.
# from apps.user.models import User_Model

# # =========================
# # Magic Link Token
# # =========================

# class MagicLinkToken(models.Model):
#     """secure magic link tokens with enhanced security"""
#     TOKEN_TYPES = [
#         ('login', 'Login'),
#         ('register', 'Registration Verificaion'),
#         ('invite', 'Team Invitation'),
#     ]

#     user = models.ForeignKey(
#         User_Model, on_delete=models.CASCADE, null=True, blank=True)
#     # Supports registration, invitations, email changes
#     email = models.EmailField()
#     token = models.CharField('Token', max_length=128, unique=True)
#     token_type = models.CharField(
#         choices=TOKEN_TYPES, default='login', max_length=30)

#     # security tracking
#     ip_address = models.GenericIPAddressField()
#     # A user agent is a string that identifies the browser, operating system, and device making the request.
#     user_agent = models.TextField(blank=True)
#     # A unique identifier created by combining multiple device characteristics.
#     device_fingerprint = models.CharField(max_length=64, blank=True)

#     # Token lifecycle
#     created_at = models.DateTimeField(auto_now_add=True)
#     expires_at = models.DateTimeField()
#     used_at = models.DateTimeField(null=True, blank=True)

#     # Metadata
#     metadata = models.JSONField(default=dict, blank=True)

#     def generate_secure_token(self):
#         """Generate cryptographically secure token"""
#         base_token = secrets.token_urlsafe(32)
#         token_data = f"{self.email}--{timezone.now().isoformat()}--{base_token}"
#         hashed = hashlib.sha256(token_data.encode()).hexdigest()
#         return f"{base_token[:16]}--{hashed[:32]}--{base_token[16:]}"

#     def is_valid(self):
#         return not self.used_at and timezone.now() <= self.expires_at

#     def mark_used(self):
#         self.used_at = timezone.now()
#         self.save()

#     # getattr() is a built-in Python function that returns the value of an attribute from an object.
#     # If the attribute doesn’t exist, it returns a default value (if provided).
#     def get_login_url(self):
#         base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
#         return f"{base_url}/auth/verify?token={self.token}&action={self.token_type}"

#     def save(self, *args, **kwargs):
        
#         if not self.token:
#             self.token = self.generate_secure_token()
#         if not self.expires_at:
#             if self.token_type == 'login':
#                 self.expires_at = timezone.now() + timedelta(minutes=15)
#             elif self.token_type == 'register':
#                 self.expires_at = timezone.now() + timedelta(hours=24)
#             else:
#                 self.expires_at = timezone.now() + timedelta(hours=48)
#         super().save(*args, **kwargs)
