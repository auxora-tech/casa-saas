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
def client_signup(request):
    """
    Client signup - automatically creates CLIENT role
    URL: /api/client/auth/signup/
    
    Expected payload:
    {
        "work_email": "john@example.com",
        "password": "password123",
        "first_name": "John",
        "last_name": "Doe"
    }
    """
    # strip() - clean user input by removing extra whitespace
    work_email = request.data.get('work_email', '').strip().lower()
    password = request.data.get('password', '').strip()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()

    # Basic Validation
    if not all([work_email, password, first_name, last_name]):
        return Response({
            'error': 'All fields are required',
            'required_fields': ['work_email', 'password', 'first_name', 'last_name']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # check if user already exists
    if User_Model.objects.filter(work_email = work_email).exists():
        # check if they are already a client
        existing_user = User_Model.objects.get(work_email = work_email)
        client_membership = CompanyMembership.objects.filter(
            user = existing_user,
            # company__title means:
            # "Go to the company field, then get the title of that company"
            company__title = settings.DEFAULT_COMPANY['title'],
            role = 'CLIENT'
        ).first()  # first() gets the first object from a queryset, or None if empty.

        if CompanyMembership:
            return Response({
                'error': 'You already have a client account. Please sign in instead.',
                'action': 'signin',
                'signin_url': '/client/login/'
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'error': 'An account with this email already exists. If you\'re a Casa Community employee, please use the staff portal.',
                'staff_portal_url': '/employee/login/'
            }, status=status.HTTP_400_BAD_REQUEST)
    try:
        with transaction.atomic():
            # Create user
            user = User_Model.objects.create_user(
                work_email=work_email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_active=True
            )

            # Get Casa Community company
            company = Company.objects.get(title=settings.DEFAULT_COMPANY['title'])

            # Create CLIENT membership - this is the key part!
            CompanyMembership.objects.create(
                user=user,
                company=company,
                role='CLIENT',  # Automatically CLIENT because they used client endpoint
                is_active=True
            )

            # Generate tokens for immediate login
            refresh = RefreshToken.for_user(user)

            return Response({
                'success': True,
                'message': f'Welcome to Casa Community, {user.first_name}! Your NDIS participant account has been created.',
                'user_type': 'client',
                'user': {
                    'id': user.id,
                    'email': user.work_email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': 'CLIENT'
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'redirect_url': '/client/'  # Where to redirect after signup
            }, status=status.HTTP_201_CREATED)

    except Company.DoesNotExist:
        return Response({
            'error': 'Company configuration error. Please contact support.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'error': 'Registration failed. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def employee_signup(request):
    """
    Employee signup - automatically creates EMPLOYEE role
    URL: /api/auth/employee/signup/
    
    Expected payload:
    {
        "work_email": "sarah@casa-community.com",
        "password": "password123",
        "first_name": "Sarah",
        "last_name": "Smith",
        "employee_id": "CC001" (optional)
    }
    """
    work_email = request.data.get('work_email', '').strip().lower()
    password = request.data.get('password', '').strip()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()

    # Basic Validation
    if not all([work_email, password, first_name, last_name]):
        return Response({
            'error': 'All fields are required',
            'required_fields': ['work_email', 'password', 'first_name', 'last_name']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # validate employee email domain
    # if not work_email.endswith('@casa-community.com'):
    #     return Response({
    #         'error': 'Employee account must use a Casa Community email address (@casa-community.com)',
    #         'help': 'If you\re an NDIS participant, please use the participant portal.'
    #     }, status = status.HTTP_400_BAD_REQUEST)
    
    
    # check if user already exists
    if User_Model.objects.filter(work_email = work_email).exists():
        existing_user = User_Model.objects.get(work_email = work_email)
        employee_membership = CompanyMembership.objects.filter(
            user = existing_user,
            company__title = settings.DEFAULT_COMPANY['title'],
            role__in = ['SUPPORT_WORKER', 'ADMIN']
        ).first()

        if employee_membership:
            return Response({
                'error': 'You already have an employee account. Please signin instead.',
                'action': 'signin',
                'signin_url': '/auth/employee/signin/'
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'error': 'An account with this email already exists. If you\re an NDIS participant, please use the participant/client portal',
                'client_porta_url': '/client/signin/'
            },status = status.HTTP_400_BAD_REQUEST)
        
    try:
        with transaction.atomic():
            # create user
            user = User_Model.objects.create_user(
                work_email = work_email,
                password = password,
                first_name = first_name,
                last_name = last_name,
                is_active = True
            )

            # get Casa Community company
            company = Company.objects.get(title = settings.DEFAULT_COMPANY['title'])

            # create Employee membership 
            CompanyMembership.objects.create(
                user = user,
                company = company,
                role = 'ADMIN',
                is_active = True
            )

            # Generate tokens for immediate signin
            refresh = RefreshToken.for_user(user)

            return Response({
                'success': True,
                'message': f'Welcome to the Casa Community team, {user.first_name}! Your ADMIN account has been created.',
                'user_type': 'admin',
                'user': {
                    'id': user.id,
                    'email': user.work_email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': 'ADMIN',
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'redirect_url': '/employee/'
            }, status=status.HTTP_201_CREATED)
        
    except Company.DoesNotExist:
        return Response({
            'error': 'Company configuration error. Please contact support.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'error': 'Registration failed. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def client_signin(request):
    """
    Authenticate and generate refresh and access tokens for a client user

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
        user = authenticate(request, username = work_email, password = password)

        if user is not None:
            # check if account is active
            if not user.is_active:
                return Response({
                    'error': 'Account is inactive. Contact Support.'
                }, status = status.HTTP_403_FORBIDDEN)
        
            try:
                client_membership = CompanyMembership.objects.filter(
                    user = user,
                    company__title = settings.DEFAULT_COMPANY['title'],
                    role = 'CLIENT'
                ).first()
            # The issue: You're using .filter() which never raises DoesNotExist. 
            # The filter() method returns an empty queryset if no results are found, but it doesn't raise an exception.
            # therefore use filter().first()
            except CompanyMembership.DoesNotExist:
                return Response({
                    'error': 'Access denied. Client account required.'
                }, status=status.HTTP_403_FORBIDDEN)
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
                    'role': client_membership.role
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
@permission_classes([AllowAny])
def employee_signin(request):
    """
    Authenticate and generate refresh and access tokens for an employee

    Expected payload:
    {
        "work_email" : user@example.com,
        "password" : "password123",
    }
    """
    print('Request data: ',request.data)
    work_email = request.data.get('work_email', '').strip().lower()
    password = request.data.get('password', '')

    # Input Validation
    if not work_email or not password:
        return Response({
            'error': 'Email and Password are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Email format validation
    try:
        validate_email(work_email)
    except ValidationError:
        return Response(
            {'error': 'Invalid email format'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Authenticate User
    try:
        user = authenticate(request, work_email=work_email, password=password)

        print(user)

        if user is not None:
            # check if account is active
            if not user.is_active:
                return Response({
                    'error': 'Account is inactive. Contact Support.'
                }, status=status.HTTP_403_FORBIDDEN)

            try:
                client_membership = CompanyMembership.objects.filter(
                    user=user,
                    company__title=settings.DEFAULT_COMPANY['title'],
                    role__in = ['ADMIN', 'SUPPORT WORKER']
                ).first()
            except CompanyMembership.DoesNotExist:
                return Response({
                    'error': 'Access denied. Client account required.'
                }, status=status.HTTP_403_FORBIDDEN)
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
                    'role': client_membership.role
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)

        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

    except Exception as e:
        return Response({
            'error': 'An error occured during authentication'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    
# ==========================================
# ADD NEW EMPLOYEE (ADMIN ONLY)
# ==========================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_add_employee(request):
    """
    Admin can add new employees directly
    URL: /api/admin/add-employee/
    
    Only accessible by users with ADMIN role
    
    Expected payload:
    {
        "work_email": "newemployee@casa-community.com",
        "password": "temppassword123",
        "first_name": "Jane",
        "last_name": "Smith",
        "role": "EMPLOYEE"  // or "SUPPORT_WORKER", "MANAGER", etc.
    }
    """
    
    # Check if current user is admin
    try:

        admin_membership = CompanyMembership.objects.get(
            user=request.user,
            company__title='Casa Community Pty Ltd',
            role='ADMIN'
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Access denied. Admin privileges required.',
            'required_role': 'ADMIN'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get form data
    work_email = request.data.get('work_email', '').strip().lower()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    employee_role = request.data.get('role', 'EMPLOYEE').upper()

    # Add this right after getting the form data
    print("DEBUG - Received data:")
    print(f"admin details: {request.user}")
    print(f"work_email: {work_email}")
    print(f"first_name: {first_name}")
    print(f"last_name: {last_name}")
    print(f"employee_role: {employee_role}")
    print(f"Raw request.data: {request.data}")
    
    # Validate required fields
    if not all([work_email, password, first_name, last_name, employee_role]):
        return Response({
            'error': 'All fields are required',
            'required_fields': ['work_email', 'password', 'first_name', 'last_name']
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate role
    valid_employee_roles = ['EMPLOYEE', 'SUPPORT WORKER', 'MANAGER', 'ADMIN']
    if employee_role not in valid_employee_roles:
        return Response({
            'error': f'Invalid role. Must be one of: {", ".join(valid_employee_roles)}',
            'valid_roles': valid_employee_roles
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate email domain (optional)
    # if not work_email.endswith('@casa-community.com'):
    #     return Response({
    #         'error': 'Employee email must use @casa-community.com domain'
    #     }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if user already exists
    if User_Model.objects.filter(work_email=work_email).exists():
        existing_user = User_Model.objects.get(work_email=work_email)
        
        # Check if they already have an employee membership
        existing_membership = CompanyMembership.objects.filter(
            user=existing_user,
            company__title=settings.DEFAULT_COMPANY['title']
        ).first()
        
        if existing_membership:
            return Response({
                'error': f'User already exists with role: {existing_membership.role}',
                'existing_user': {
                    'email': existing_user.work_email,
                    'name': f'{existing_user.first_name} {existing_user.last_name}',
                    'current_role': existing_membership.role
                }
            }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            # Create new user
            new_user = User_Model.objects.create_user(
                work_email=work_email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                is_active=True
            )
            
            # Get Casa Community company
            company = Company.objects.get(title=settings.DEFAULT_COMPANY['title'])
            
            # Create employee membership with specified role
            membership = CompanyMembership.objects.create(
                user=new_user,
                company=company,
                role=employee_role,
                is_active=True
            )
            
            return Response({
                'success': True,
                'message': f'{first_name} {last_name} has been added as {employee_role.replace("_", " ").title()}',
                'new_employee': {
                    'id': new_user.id,
                    'email': new_user.work_email,
                    'first_name': new_user.first_name,
                    'last_name': new_user.last_name,
                    'role': membership.role,
                    'created_by': f'{request.user.first_name} {request.user.last_name}'
                },
                'next_steps': [
                    'Employee can now login with their credentials',
                    'Consider sending them their login details securely',
                    'Employee should change password on first login'
                ]
            }, status=status.HTTP_201_CREATED)
            
    except Company.DoesNotExist:
        return Response({
            'error': 'Company configuration error. Please contact support.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'error': 'Failed to create employee account. Please try again.',
            'details': str(e) if request.user.is_superuser else None  # Only show details to superuser
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==========================================
# GET ALL EMPLOYEES (ADMIN ONLY)
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_employees(request):
    """
    Get list of all employees - Admin only
    URL: /api/admin/employees/
    """

    # Check if current user is admin
    try:
        admin_membership = CompanyMembership.objects.get(
            user=request.user,
            company__title=settings.DEFAULT_COMPANY['title'],
            role='ADMIN'
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)

    # Get all employee memberships
    employee_memberships = CompanyMembership.objects.filter(
        company__title=settings.DEFAULT_COMPANY['title'],
        role__in=['EMPLOYEE', 'SUPPORT_WORKER', 'ADMIN']
    ).select_related('user')

    employees = []
    for membership in employee_memberships:
        employees.append({
            'id': membership.user.id,
            'email': membership.user.work_email,
            'first_name': membership.user.first_name,
            'last_name': membership.user.last_name,
            'role': membership.role,
            'is_active': membership.is_active,
            'joined_at': membership.joined_at.strftime('%Y-%m-%d'),
            'is_current_user': membership.user.id == request.user.id
        })

    return Response({
        'employees': employees,
        'total_count': len(employees),
        'role_summary': {
            'ADMIN': len([e for e in employees if e['role'] == 'ADMIN']),
            'MANAGER': len([e for e in employees if e['role'] == 'MANAGER']),
            'SUPPORT_WORKER': len([e for e in employees if e['role'] == 'SUPPORT_WORKER']),
            'EMPLOYEE': len([e for e in employees if e['role'] == 'EMPLOYEE'])
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_current_user(request):
    """
    Get current authenticated user details
    URL: /api/user/profile/
    """
    user = request.user
    # Get user's membershipt to determine role
    try:
        membership = CompanyMembership.objects.filter(
            user = user,
            company__title = settings.DEFAULT_COMPANY['title']
        )
        role = membership.role
        user_type = 'client' if role == 'CLIENT' else 'employee'
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': "User membership not found"
        }, status=status.HTTP_404_NOT_FOUND)
    
    return Response({
        'user': {
            'id': user.id,
            'email': user.work_email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role
        },
        'user_type': user_type,
        'membership': {
            'company': membership.company.title,
            'role': membership.role,
            'is_active': membership.is_active
        }
    })

# ==========================================
# UPDATE EMPLOYEE ROLE (ADMIN ONLY)
# ==========================================


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def admin_update_employee(request, employee_id):
    """
    Update employee role or status - Admin only
    URL: /api/admin/employees/<employee_id>/
    
    Expected payload:
    {
        "role": "SUPPORT_WORKER",
        "is_active": true
    }
    """

    # Check if current user is admin
    try:
        admin_membership = CompanyMembership.objects.get(
            user=request.user,
            company__title='Casa Community Pty Ltd',
            role='ADMIN'
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Access denied. Admin privileges required.'
        }, status=status.HTTP_403_FORBIDDEN)

    # Get employee membership
    try:
        employee_membership = CompanyMembership.objects.get(
            user__id=employee_id,
            company__title='Casa Community Pty Ltd'
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Employee not found'
        }, status=status.HTTP_404_NOT_FOUND)

    # Prevent admin from modifying their own account (safety measure)
    if employee_membership.user.id == request.user.id:
        return Response({
            'error': 'Cannot modify your own account'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Update fields if provided
    new_role = request.data.get('role')
    new_status = request.data.get('is_active')

    if new_role:
        valid_roles = ['EMPLOYEE', 'SUPPORT_WORKER', 'MANAGER', 'ADMIN']
        if new_role.upper() not in valid_roles:
            return Response({
                'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        employee_membership.role = new_role.upper()

    if new_status is not None:
        employee_membership.is_active = new_status

    employee_membership.save()

    return Response({
        'success': True,
        'message': f'Employee {employee_membership.user.first_name} {employee_membership.user.last_name} updated successfully',
        'updated_employee': {
            'id': employee_membership.user.id,
            'email': employee_membership.user.work_email,
            'first_name': employee_membership.user.first_name,
            'last_name': employee_membership.user.last_name,
            'role': employee_membership.role,
            'is_active': employee_membership.is_active
        }
    })
