# from django.utils import timezone
from django.conf import settings
# from django.core.cache import cache
from django.contrib.auth import get_user_model, authenticate
# from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, permissions
from django.core.validators import validate_email 
from django.core.exceptions import ValidationError 
from django.db import transaction
# from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken  # type: ignore
from rest_framework_simplejwt.exceptions import TokenError  # type: ignore

from . serializers import SignupSerializer
from apps.user.models import User_Model
from apps.user.serializers import UserSerializer
from apps.company.models import Company
from apps.membership.models import CompanyMembership
# from .utils import get_client_ip, send_magic_link_email
# from . models import MagicLinkToken

# | Permission Class |    Description |
# | ------------------ | -------------------------------------------------------------- |
# | `AllowAny`         | Anyone(even unauthenticated users) can access the view |
# | `IsAuthenticated`  | Only authenticated (logged-in) users can access                |
# | `IsAdminUser`      | Only users with `is_staff = True` |
# | Custom permissions | You can create your own, like "is company admin" or "is owner" |

# If fail_silently = True, Django won't crash if there's an email-sending error(like wrong SMTP).

# If fail_silently = False, Django will raise an exception if email fails.

"""
The @api_view decorator wraps your function and transforms the Django request
into a DRF Request object before passing it to your view.
"""
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    Create a new user account with company membership

    Expected Payload:
    {
        "work_email" : "user@example.com",
        "password" : "password123",
        "first_name" : "John",
        "last_name" : "Doe"
    }
    """
    serialized_data = SignupSerializer(data=request.data)
    if serialized_data.is_valid():
        try:
            # database transaction to ensure data consistency
            with transaction.atomic():
                # create user
                user = serialized_data.save()

                # get or create company
                company, created = Company.objects.create(
                    title = settings.DEFAULT_COMPANY['title'],
                    defaults = settings.DEFAULT_COMPANY
                )

                # create company user membership object
                CompanyMembership.objects.create(
                    user=user,
                    company=company,
                    role='ADMIN',
                    is_active=True
                )

                return Response({
                    'message': f'{user.first_name} is successfully registered with the company {company.title}',
                    'user': {
                        'id': user.id,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'email': user.work_email
                    },
                    'company': {
                        'title': company.title,
                        'no_of_employees': company.no_of_employees,
                        'country': company.country,
                        'address': company.address,
                        'is_active': company.is_active
                    }
                }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': 'An error occurred during registration'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serialized_data.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def signin(request):
    """
    Authenticate and generate refresh and access tokens for a user

    Expected payload:
    {
        "work_email" : user@example.com,
        "password" : "password123"
    }
    """
    work_email = request.data.get('work_email', '').strip().lower()
    password = request.data.get('password', '')

    # Input Validation
    if not work_email or not password:
        return Response({
            'error': 'Email and Password are required'
        }, status = status.HTTP_400_BAD_REQUEST)
    
    # Email format validation
    try:
        validate_email(work_email)
    except ValidationError:
        return Response(
            {'error': 'Invalid email format'},
            status = status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate User
    try:
        user = authenticate(request, work_email = work_email, password = password)

        if user is not None:
            # check if account is active
            if not user.is_active:
                return Response({
                    'error': 'Account is inactive. Contact Support.'
                }, status = status.HTTP_403_FORBIDDEN)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.work_email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_active': user.is_active,
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)
        
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status = status.HTTP_401_UNAUTHORIZED)
        
    except Exception as e:
        return Response({
            'error': 'An error occured during authentication'
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def signout(request):
    """
    Signout with refresh token blacklisting
    
    Expected payload:
    {
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
    """
    try:
        # get refresh token from request 
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response({
                'error': 'Refresh token is required for secure logout'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Blacklist the refresh token
        token = RefreshToken(refresh_token)
        token.blacklist()  # prevents the token from being used again

        user = request.user

        return Response({
            'message': f'Goodbye! {user.first_name}! You have been signed out securely.',
            'detail': 'Refresh token has been blacklisted'
        }, status = status.HTTP_200_OK)
    
    except TokenError:
        return Response({
            'error': 'Invalid refresh token'
        }, status = status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({
            'error': "Logout Failed!"
        }, status = status.HTTP_500_INTERNAL_SERVER_ERROR)
