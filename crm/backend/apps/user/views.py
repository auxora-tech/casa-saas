from django.shortcuts import render
import secrets
import hashlib
from datetime import timedelta
from django.db import models, transaction
from django.utils import timezone
from django.core.mail import send_mail 
from django.template.loader import render_to_string 
from django.conf import settings
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated 
from rest_framework_simplejwt.tokens import RefreshToken   # type:ignore
from rest_framework.response import Response
from rest_framework import status 

# Create your views here.
from . models import User_Model, LoginAttempt, UserSession, AuditLog
from apps.company.models import Company
from apps.membership.models import CompanyMembership


# =========================
# Magic Link Token
# =========================

class MagicLinkToken(models.Model):
    """secure magic link tokens with enhanced security"""
    TOKEN_TYPES = [
        ('login', 'Login'),
        ('register', 'Registration Verificaion'),
        ('invite', 'Team Invitation'),
    ]

    user = models.ForeignKey(User_Model, on_delete=models.CASCADE, null=True, blank=True)
    # Supports registration, invitations, email changes
    email = models.EmailField()
    token = models.CharField('Token', max_length=128, unique=True)
    token_type = models.CharField(choices=TOKEN_TYPES, default = 'login', max_length=30)

    # security tracking
    ip_address = models.GenericIPAddressField()
    # A user agent is a string that identifies the browser, operating system, and device making the request.
    user_agent = models.TextField(blank=True)
    # A unique identifier created by combining multiple device characteristics.
    device_fingerprint = models.CharField(max_length=64, blank=True)

    # Token lifecycle
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    # Metadata
    metadata = models.JSONField(default=dict, blank=True)

    def generate_secure_token(self):
        """Generate cryptographically secure token"""
        base_token = secrets.token_urlsafe(32)
        token_data = f"{self.email}--{timezone.now().isoformat()}--{base_token}"
        hashed = hashlib.sha256(token_data.encode()).hexdigest()
        return f"{base_token[:16]}--{hashed[:32]}--{base_token[16:]}"
    
    def is_valid(self):
        return not self.used_at and timezone.now() <= self.expires_at
    
    def mark_used(self):
        self.used_at = timezone.now()
        self.save()

    # getattr() is a built-in Python function that returns the value of an attribute from an object.
    # If the attribute doesn’t exist, it returns a default value (if provided).
    def get_login_url(self):
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        return f"{base_url}/auth/verify?token={self.token}&action={self.token_type}"

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.generate_secure_token()
        if not self.expires_at:
            if self.token_type == 'login':
                self.expires_at = timezone.now() + timedelta(minutes=15)
            elif self.token_type == 'register':
                self.expires_at = timezone.now() + timedelta(hours=24)
            else:
                self.expires_at = timezone.now() + timedelta(hours = 48)
        super().save(*args, **kwargs)

# ====================
# UTILITY FUNCTIONS
# ====================

def get_client_ip(request):
    """Get real client IP address"""
    # request.META is a dictionary-like object in Django that contains all the HTTP headers.
    # HTTP_X_FORWARDED_FOR is a common proxy header that holds the original IP address of the client
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '127.0.0.1')

def send_magic_link_email(magic_token, action):
    """send magic link email with beautiful templates"""

    try:
        link_url = magic_token.get_login_url()

        # Email content based on action
        email_configs = {
            'login': {
                'subject':'🔐 Your secure login link',
                'template': 'emails/magic_link_login.html'
            },
            'register':{
                'subject': '🎉 Verify your email to get started',
                'template': 'emails/magic_link_verify.html'
            },
            'invite':{
                'subject': '👋 You\'re invited to join a team',
                'template': 'emails/magic_link_invite.html'
            }
        }

        config = email_configs.get(action, email_configs['login'])

        html_content = render_to_string(config['template'], {
            'magic_link': link_url,
            'email': magic_token.email,
            'expires_at': magic_token.expires_at,
            'comapny_name': getattr(settings, 'COMPANY_NAME', 'CRM SaaS'),
            'support_email': getattr(settings, 'SUPPORT_EMAIL', 'support@yourcrm.com'),
            'action':action,
            'user': magic_token.user
        })

        send_mail(
            subject=config['subject'],
            message = 'Please use an HTML-capable email client to view this message.',
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@yourcrm.com'),
            recipient_list=html_content,
            fail_silently=False
        )
    except Exception as e:
        print(f"Failed to send magic link email: {e}")
        return False 
    

# =====================
# MAGIC LINK API VIEWS
# =====================


@api_view(['POST'])
@permission_classes([AllowAny])
def send_magic_link(request):
    """
    Send magic link to user's email
    POST /api/auth/magic-link/
    """
    email = request.data.get('email', '').lower().strip()
    action = request.data.get('action', 'login')
    device_info = request.data.get('device_info', {})

    if not email:
        return Response({'error': 'Email is required'}, status = 400)

    # get client info
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    device_fingerprint = device_info.get('fingerprint', '')

    # rate limiting
    email_key = f"magic_link_email:{email}"
    ip_key = f"magic_link_ip:{ip_address}"

    email_attempts = cache.get(email_key, 0)
    ip_attempts = cache.get(ip_key, 0) 

    if email_attempts >= 3:
        return Response({
            'error': 'Too many requests for this email. Please try again in 1 hour.',
            'retry_after': 3600
        }, status=429)
    
    if ip_attempts >= 10:
        return Response({
            'error': 'Too many requests from this device. Please try again in 1 hour.',
            'retry_after': 3600
        }, status=429)
    
    try:
        # check if user exists
        user = None 
        try:
            user = User_Model.objects.get(work_email = email)
            if action == 'register' and user:
                # Redirect existing users to login
                return Response({
                    'message': 'An account with this email already exists. Check your email for a login link.',
                    'action': 'login',
                    'user_exists': True
                })
        except User_Model.DoesNotExist:
            if action == 'login':
                # Don't reveal that user doesn't exist for security
                pass

        # Invalidate existing tokens
        MagicLinkToken.objects.filter(
            email = email,
            token_type = action,
            used_at__isnull = True
        ).update(used_at = timezone.now())

        # Create new magic link token 
        magic_token = MagicLinkToken.objects.create(
            user = user,
            email = email,
            token_type = action,
            ip_address = ip_address,
            user_agent = user_agent,
            device_fingerprint = device_fingerprint,
            metadata = {'device_info': device_info}
        )

        # Send email 
        email_sent = send_magic_link_email(magic_token, action)

        if email_sent:
            # Update rate limiting
            cache.set(email_key, email_attempts + 1, 3600)
            cache.set(ip_key, ip_attempts + 1, 3600) 

            # Log attempt
            LoginAttempt.objects.create(
                email = email,
                ip_address = ip_address,
                user_agent = user_agent,
                attempt_type = 'magic_link_sent',
                success = True
            )

            messages = {
                'login': 'Check your email! We\'ve sent you a secure login link.',
                'register': 'Almost done! Check your email to verify your account.',
                'invite': 'Invitation sent! Check your email to join the team.'
            }

            return Response({
                'message': messages.get(action, 'Magic link sent! Check your email.'),
                'email': email,
                'action': action,
                'expires_in_minutes': 15 if action == 'login' else (24 * 60)
            })
        else:
            return Response({
                'error': 'Failed to send email. Please try again.',
                'email_service_error': True,
            }, status=500)
    except Exception as e:
        # Log failed attempt
        LoginAttempt.objects.create(
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            attempt_type='magic_link_failed',
            success=False,
            failure_reason=str(e)
        )

        return Response({
            'error': 'Failed to send magic link. Please try again.',
            'details': str(e) if settings.DEBUG else None
        }, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_magic_link(request):
    """
    Verify magic link token and authenticate user
    POST /api/auth/verify/
    """

    token = request.data.get('token')
    device_fingerprint = request.data.get('device_fingerprint', '')

    if not token:
        return Response({'error': 'Token is required'}, status = 400)
    
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')

    try:
        # Find and validate token 
        magic_token = MagicLinkToken.objects.get(token = token)

        if not magic_token.is_valid():
            return Response({
                'error': 'This link has expired or been used. Please request a new one.',
                'expired': True,
                'token_type': magic_token.token_type
            }, status = 401)
        
        # Handle different token types
        if magic_token.token_type == 'login':
            return handle_magic_login(magic_token, request)
        elif magic_token.token_type == 'register':
            return handle_email_verification(magic_token, request)
        elif magic_token.token_type == 'invite':
            return handle_team_invalidation(magic_token, request)
        else:
            return Response({'error': 'Invalid token type'}, status = 400)
        
    except MagicLinkToken.DoesNotExist:
        # Log failed attempt
        LoginAttempt.objects.create(
            email='unknown',
            ip_address=ip_address,
            user_agent=user_agent,
            attempt_type='magic_link_verify_failed',
            success=False,
            failure_reason='Invalid token'
        )

        return Response({
            'error': 'Invalid or expired link. Please request a new one.',
            'invalid_token' : True
        }, status=401)
    

def handle_magic_login(magic_token, request):
    """Handle magic link login"""
    if not magic_token.user:
        return Response({
            'error': 'No account found with this email.',
            'redirect_to': 'register',
            'email': magic_token.email
        }, status=404)
    
    user = magic_token.user

    # Security checks
    if not user.is_active:
        return Response({
            'error': 'Account is deactivated. Contact support.'
        }, status=403)
    
    if not user.email_verified:
        # Send verification link 
        send_verification_magic_link(user)
        return Response({
            'error': 'Please verify your email first. We\'ve sent a new verificiation link.',
            'needs_verification': True,
            'email': user.work_email
        }, status=403)
    
    # Mark token as used
    magic_token.mark_used() 

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    # Create session tracking
    session = UserSession.objects.create(
        user = user,
        device_fingerprint = magic_token.device_fingerprint,
        ip_address = magic_token.ip_address,
        user_agent = magic_token.user_agent,
        is_active = True
    )

    # Get user's companies and roles
    companies = user
