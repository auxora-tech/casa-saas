from django.utils import timezone
from django.conf import settings
from django.core.cache import cache
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore

from apps.user.models import User_Model, LoginAttempt, UserSession, AuditLog
from apps.company.models import Company
from apps.membership.models import CompanyMembership
from .utils import get_client_ip, send_magic_link_email
from . models import MagicLinkToken
# Create your views here.


@api_view(['POST'])
@permission_classes([AllowAny])
def send_magic_link(request):
    """
    Send magic link to user's email
    POST /api/auth/magic-link/
    """
    email = request.data.get('work_email', '').lower().strip()
    action = request.data.get('action', 'login')
    device_info = request.data.get('device_info', {})

    if not email:
        return Response({'error': 'Email is required'}, status=400)

    # Get client info
    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    device_fingerprint = device_info.get('fingerprint', '')

    # Rate limiting
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
        # Check if user exists
        user = None
        try:
            user = User_Model.objects.get(work_email=email)
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
            email=email,
            token_type=action,
            used_at__isnull=True
        ).update(used_at=timezone.now())

        # Create new magic link token
        magic_token = MagicLinkToken.objects.create(
            user=user,
            email=email,
            token_type=action,
            ip_address=ip_address,
            user_agent=user_agent,
            device_fingerprint=device_fingerprint,
            metadata={'device_info': device_info}
        )

        # Send email
        email_sent = send_magic_link_email(magic_token, action)

        if email_sent:
            # Update rate limiting
            cache.set(email_key, email_attempts + 1, 3600)
            cache.set(ip_key, ip_attempts + 1, 3600)

            # Log attempt
            LoginAttempt.objects.create(
                email=email,
                ip_address=ip_address,
                user_agent=user_agent,
                attempt_type='magic_link_sent',
                success=True
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
                'email_service_error': True
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
        return Response({'error': 'Token is required'}, status=400)

    ip_address = get_client_ip(request)
    user_agent = request.META.get('HTTP_USER_AGENT', '')

    try:
        # Find and validate token
        magic_token = MagicLinkToken.objects.get(token=token)

        if not magic_token.is_valid():
            return Response({
                'error': 'This link has expired or been used. Please request a new one.',
                'expired': True,
                'token_type': magic_token.token_type
            }, status=401)

        # Handle different token types
        if magic_token.token_type == 'login':
            return handle_magic_login(magic_token, request)
        elif magic_token.token_type == 'register':
            return handle_email_verification(magic_token, request)
        elif magic_token.token_type == 'invite':
            return handle_team_invitation(magic_token, request)
        else:
            return Response({'error': 'Invalid token type'}, status=400)

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
            'invalid_token': True
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
        return Response({'error': 'Account is deactivated. Contact support.'}, status=403)

    if not user.email_verified:
        # Send verification link
        send_verification_magic_link(user)
        return Response({
            'error': 'Please verify your email first. We\'ve sent a new verification link.',
            'needs_verification': True,
            'email': user.work_email
        }, status=403)

    # Mark token as used
    magic_token.mark_used()

    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)

    # Create session tracking
    session = UserSession.objects.create(
        user=user,
        device_fingerprint=magic_token.device_fingerprint,
        ip_address=magic_token.ip_address,
        user_agent=magic_token.user_agent,
        is_active=True
    )

    # Get user's companies and roles
    companies = user.get_companies()

    # Log successful login
    LoginAttempt.objects.create(
        email=user.work_email,
        ip_address=magic_token.ip_address,
        user_agent=magic_token.user_agent,
        attempt_type='magic_link_login',
        success=True
    )

    AuditLog.log_action(
        user=user,
        action_type='login',
        description='logged in via magic link',
        request=request,
        metadata={'login_method': 'magic_link', 'session_id': session.id}
    )

    return Response({
        'success': True,
        'message': 'Welcome back! Login successfull',
        'user': {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.work_email,
            'email_verified': user.email_verified,
            'last_login': user.last_login
        },
        'companies': [{
            'id': m.company.id,
            'title': m.company.title,
            'role': m.role,
            'is_active': m.is_active,
            'joined_at': m.joined_at
        } for m in companies],
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        },
        'session': {
            'id': session.id,
            'device_fingerprint': session.device_fingerprint
        },
        'redirected_to': '/dashboard'
    })


def handle_email_verification(magic_token, request):
    """Handle email verification from registration"""

    if not magic_token.user:
        return Response({
            'error': 'Invalid verification token',
            'redirect_to': 'register'
        }, status=400)

    user = magic_token.user

    # verify email and activate account
    user.email_verified = True
    user.is_active = True
    user.save()

    magic_token.mark_used()

    # Auto-login after verification
    refresh = RefreshToken.for_user(user)

    # Get user's company (should have one from registration)
    companies = user.get_companies()

    AuditLog.log_action(
        user=user,
        action_type='user.email_verified',
        description='Email verified and account activated',
        request=request
    )

    return Response({
        'success': True,
        'message': 'Email verified! Welcome to your CRM.',
        'user': {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.work_email,
            'email_verified': True
        },
        'companies': [{
            'id': m.company.id,
            'title': m.company.title,
            'role': m.role
        } for m in companies],
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        },
        'redirect_to': '/onboarding',
        'new_user': True
    })

def handle_team_invitation(magic_token, request):
    """Handle team invitation acceptance"""
    # Implementation for team invitations
    return Response({
        'message': 'Team invitation feature coming soon!'
    })


# ============================
# REGISTRATION WITH MAGIC LINK
# ============================

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register user and send verification magic link 
    POST /api/auth/register/
    """
    data = request.data 
    ip_address = get_client_ip(request)

    # Rate limiting 
    rate_limit_key = f"register_attempts: {ip_address}"
    attempts = cache.get(rate_limit_key, 0)

    if attempts >= 5:
        return Response({
            'error': 'Too many registration attempts. Please try again in 1 hour.',
            'retry_after': 3600  
        }, status = 429)
    
    # Validate required fields
    required_fields = ['first_name', 'last_name', 'work_email', 'title']
    missing_fields = [field for field in required_fields if not data.get(field)]

    if missing_fields:
        return Response({
            'error': f'Missing required fields: {', '.join(missing_fields)}'
        }, status = 400)
    
    email = data['work_email'].lower().strip

    # check if user already exists
    if User_Model.objects.filter(work_email = email).exists():
        cache.set(rate_limit_key, attempts+1, 3600)
        return Response({
            'message': 'If this email is not already registered, you will receive a verification email.',
            'email': email
        })
    
    try:
        with transaction.atomic():
            # Create user (inactive until email verified)
            user = User_Model.objects.create_user(
                work_email = email,
                first_name = data['first_name'].strip(),
                last_name = data['last_name'].strip(),
                is_active = False,
                email_verified = False
            )

            # Create Company
            company = Company.objects.create(
                title = data['title'].strip(),
                category = data.get('category', ''),
                no_of_employees = data.get('no_of_employees', '1-10'),
                country = data.get('country', ''),
                description = data.get('description', '')
            )

            # Make user the admin
            CompanyMembership.objects.create(
                user = user,
                company = company,
                role = 'admin',
                is_active = True
            )

            # Create verification magic link
            magic_token = MagicLinkToken.objects.create(
                user = user,
                email = email,
                token_type = 'register',
                ip_address = ip_address,
                user_agent = request.META.get('HTTP_USER_AGENT', ''),
                metadata = {
                    'registration_data': data,
                    'company_id': company.id
                }
            )

            # Send verification email
            email_sent = send_magic_link_email(magic_token, 'register')

            # Log registration
            AuditLog.log_action(
                user = user,
                action_type = 'register',
                description=f'User registered with company: {company.title}',
                request=request,
                comapny_id = company.id
            )

            return Response({
                'success': True,
                'message': 'Registration successfull! Check your email to verify your account.',
                'email': email,
                'company': {
                    'id': company.id,
                    'title': company.title
                },
                'next_step': 'email_verification'
            }, status = 201)
        
    except Exception as e:
        cache.set(rate_limit_key, attempts + 1, 3600)
        return Response({
            'error': 'Registration failed. Please try again.',
            'details': str(e) if settings.DEBUG else None
        }, status = 400)


# ===================================
# USER PROFILE AND SESSION MANAGEMENT
# ===================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current user profile with companies
    GET /api/auth/me/
    """

    user = request.user
    companies = user.get_companies()

    return Response({
        'user': {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.work_email,
            'email_verified': user.email_verified,
            'date_joined': user.date_joined,
            'last_login': user.last_login
        },
        'companies': [{
            'id': m.company.id,
            'title': m.company.title,
            'role': m.role,
            'is_active': m.is_active,
            'joined_at': m.joined_at,
            'company': {
                'industry': m.company.category,
                'employee_range': m.company.no_of_employees,
                'country': m.company.country
            }
        } for m in companies],
        'permissions': {
            company.id: get_user_permissions(membership)
            for membership in companies
            for company in [membership.company]
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user and invalidate session
    POST /api/auth/logout/
    """
    try:
        # Get current session and mark as inactive
        device_fingerprint = request.data.get('device_fingerprint')
        if device_fingerprint:
            UserSession.objects.filter(
                user = request.user,
                device_fingerprint = device_fingerprint,
                is_active = True
            ).update(is_active = False)

        # Blacklist refresh token if provided
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass # Token might already be invalid 
         # Log logout
        AuditLog.log_action(
            user=request.user,
            action_type='user.logout',
            description='User logged out',
            request=request
        )

        return Response({
            'message': 'Logout successful',
            'redirect_to': '/login'
        })

    except Exception as e:
        return Response({
            'message': 'Logout completed',
            'error': str(e) if settings.DEBUG else None
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_sessions(request):
    """
    Get user's active sessions for security dashboard
    GET /api/auth/sessions/
    """

    sessions = request.user.sessions.filter(is_active = True).order_by('-last_activity')
    current_device = request.META.get('HTTP_X_FINGERPRINT')

    session_data = []
    for session in sessions:
        session_data.append({
            'id': session.id,
            'device_type': session.device_type or 'Unknown',
            'browser': session.browser or 'Unknown Browser',
            'os': session.os or 'Unknown OS',
            'ip_address': session.ip_address,
            'location': f"{session.city}, {session.country}" if session.city else 'Unknown Location',
            'last_activity': session.last_activity,
            'created_at': session.created_at,
            'is_current': session.device_fingerprint == current_device
        })

    return Response({
        'sessions': session_data,
        'total_active': len(session_data)
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def revoke_session(request):
    """
    Revoke a specific session
    POST /api/auth/session/revoke/
    """

    session_id = request.data.get('session_id')

    if not session_id:
        return Response({'error': 'session_id required'}, status = 400)
    
    try:
        session = request.user.session.get(id = session_id, is_active = True)
        session.is_active = False
        session.save()

        AuditLog.log_action(
            user=request.user,
            action_type='user.session_revoked',
            description=f'Session revoked: {session.device_type}',
            request=request,
            metadata={'revoked_session_id': session_id}
        )

        return Response({'message': 'Session revoked successfully'})

    except UserSession.DoesNotExist:
        return Response({'error': 'Session not found'}, status=404)


def get_user_permissions(membership):
    """Get user permissions based on role"""
    role_permissions = {
        'OWNER': [
            'company.*', 'users.*', 'contacts.*',
            'deals.*', 'settings.*', 'billing.*'
        ],
        'ADMIN': [
            'company.view', 'company.edit', 'users.*',
            'contacts.*', 'deals.*', 'settings.*'
        ],
        'STAFF': [
            'company.view', 'users.view', 'contacts.*', 'deals.*'
        ],
        'VIEWER': [
            'company.view', 'users.view', 'contacts.view', 'deals.view'
        ]
    }
    return role_permissions.get(membership.role, [])


def send_verification_magic_link(user):
    """Send new verification link to user"""
    magic_token = MagicLinkToken.objects.create(
        user = user,
        email = user.work_email,
        token_type = 'register',
        ip_address = '127.0.0.1',
        user_agent = 'System'
    )
    return send_magic_link_email(magic_token, 'register')
