# ==========================================
# EMPLOYEE PROFILE COMPLETION VIEWS
# ==========================================

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from . models import Employee  # Adjust import path as needed
from apps.membership.models import CompanyMembership
from datetime import datetime

# ==========================================
# GET EMPLOYEE PROFILE
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_employee_profile(request):
    """
    Get current employee's profile information
    URL: /api/employee/profile/
    """
    
    # Verify user is an employee/admin
    try:
        membership = CompanyMembership.objects.get(
            user=request.user,
            company__title='Casa Community Pty Ltd',
            role__in=['EMPLOYEE', 'ADMIN', 'SUPPORT_WORKER']
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Access denied. Employee account required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get employee profile
    try:
        employee = Employee.objects.get(user=request.user)
        profile_exists = True
    except Employee.DoesNotExist:
        # Return empty profile structure
        profile_exists = False
        employee = None
    
    if profile_exists:
        profile_data = {
            'id': employee.id,
            'uuid': str(employee.uuid),
            
            # Basic Info
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.work_email,
            'date_of_birth': employee.date_of_birth.strftime('%Y-%m-%d') if employee.date_of_birth else None,
            'address': employee.address,
            'phone': str(employee.phone) if employee.phone else None,
            'suburb': employee.suburb,
            'state_territory': employee.state_territory,
            'postcode': employee.postcode,
            'tfn': employee.tfn,
            
            # Superannuation Details
            'fund_name': employee.fund_name,
            'abn': employee.abn,
            'member_number': employee.member_number,
            
            # Bank Details
            'bank_name': employee.bank_name,
            'account_name': employee.account_name,
            'bsb': employee.bsb,
            'account_number': employee.account_number,
            
            # Emergency Contact Details
            'emergency_contact_first_name': employee.emergency_contact_first_name,
            'emergency_contact_last_name': employee.emergency_contact_last_name,
            'emergency_contact_number': str(employee.emergency_contact_number) if employee.emergency_contact_number else None,
            'emergency_contact_home': str(employee.emergency_contact_home) if employee.emergency_contact_home else None,
            'emergency_contact_relationship': employee.emergency_contact_relationship,
        }
    else:
        profile_data = {
            'profile_exists': False,
            'message': 'Employee profile not created yet. Please complete your profile.'
        }
    
    return Response({
        'user': {
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'email': request.user.work_email
        },
        'membership': {
            'role': membership.role,
            'company': membership.company.title
        },
        'profile': profile_data,
        'profile_exists': profile_exists
    })

# ==========================================
# CREATE/UPDATE EMPLOYEE PROFILE
# ==========================================

@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def create_update_employee_profile(request):
    """
    Create or update employee profile
    URL: /api/employee/profile/
    
    Expected payload structure:
    {
        // Basic Info (REQUIRED)
        "date_of_birth": "1990-05-15",
        "address": "123 Main St, Adelaide SA 5000",
        "phone": "+61412345678",
        "tfn": "123456789",
        
        // Location (OPTIONAL)
        "suburb": "Adelaide",
        "state_territory": "SA", 
        "postcode": "5000",
        
        // Superannuation (OPTIONAL)
        "fund_name": "Australian Super",
        "abn": "123456789012",
        "member_number": 12345,
        
        // Bank Details (REQUIRED)
        "bank_name": "Commonwealth Bank",
        "account_name": "John Smith",
        "bsb": "063000",
        "account_number": "1234567890",
        
        // Emergency Contact (REQUIRED)
        "emergency_contact_first_name": "Jane",
        "emergency_contact_last_name": "Smith",
        "emergency_contact_number": "+61412345679",
        "emergency_contact_home": "+61812345678",
        "emergency_contact_relationship": "Spouse"
    }
    """
    
    # Verify user is an employee/admin
    try:
        membership = CompanyMembership.objects.get(
            user=request.user,
            company__title='Casa Community Pty Ltd',
            role__in=['EMPLOYEE', 'ADMIN', 'SUPPORT WORKER']
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Access denied. Employee account required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get data from request
    data = request.data
    
    # Required fields for employee profile
    required_fields = [
        'first_name', 'last_name', 'email', 'date_of_birth', 'address', 'phone', 'tfn',  # Basic info
        'bank_name', 'account_name', 'bsb', 'account_number',  # Bank details
        'emergency_contact_first_name', 'emergency_contact_number', 'emergency_contact_relationship'  # Emergency contact
    ]
    
    missing_fields = []
    for field in required_fields:
        if not data.get(field):
            missing_fields.append(field)
    
    if missing_fields:
        return Response({
            'error': 'Required fields are missing',
            'missing_fields': missing_fields,
            'required_fields': required_fields
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate TFN format (basic check - 9 digits)
    tfn = data.get('tfn', '').replace(' ', '').replace('-', '')
    if not tfn.isdigit() or len(tfn) != 9:
        return Response({
            'error': 'TFN must be 9 digits'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate BSB format (6 digits)
    bsb = data.get('bsb', '').replace('-', '').replace(' ', '')
    if not bsb.isdigit() or len(bsb) != 6:
        return Response({
            'error': 'BSB must be 6 digits'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate account number (up to 10 digits)
    account_number = data.get('account_number', '').replace(' ', '').replace('-', '')
    if not account_number.isdigit() or len(account_number) > 10:
        return Response({
            'error': 'Account number must be digits only, maximum 10 digits'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            # Get or create employee profile
            employee, created = Employee.objects.get_or_create(
                user=request.user,
                defaults={
                    # Basic Info
                    'first_name': request.user.first_name,
                    'last_name': request.user.last_name,
                    'email': request.user.work_email,
                    'date_of_birth': datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
                    'address': data['address'],
                    'phone': data['phone'],
                    'tfn': tfn,
                    
                    # Bank Details
                    'bank_name': data['bank_name'],
                    'account_name': data['account_name'],
                    'bsb': bsb,
                    'account_number': account_number,
                    
                    # Emergency Contact
                    'emergency_contact_first_name': data['emergency_contact_first_name'],
                    'emergency_contact_number': data['emergency_contact_number'],
                    'emergency_contact_relationship': data['emergency_contact_relationship'],
                }
            )
            
            if not created:
                # Update existing profile
                employee.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
                employee.address = data['address']
                employee.phone = data['phone']
                employee.tfn = tfn
                
                # Bank details
                employee.bank_name = data['bank_name']
                employee.account_name = data['account_name']
                employee.bsb = bsb
                employee.account_number = account_number
                
                # Emergency contact
                employee.emergency_contact_first_name = data['emergency_contact_first_name']
                employee.emergency_contact_number = data['emergency_contact_number']
                employee.emergency_contact_relationship = data['emergency_contact_relationship']
            
            # Update optional fields
            optional_fields = {
                'suburb': 'suburb',
                'state_territory': 'state_territory',
                'postcode': 'postcode',
                'fund_name': 'fund_name',
                'abn': 'abn',
                'member_number': 'member_number',
                'emergency_contact_last_name': 'emergency_contact_last_name',
                'emergency_contact_home': 'emergency_contact_home'
            }
            
            for api_field, model_field in optional_fields.items():
                if data.get(api_field) is not None:
                    setattr(employee, model_field, data[api_field])
            
            employee.save()
            
            action = 'created' if created else 'updated'
            
            return Response({
                'success': True,
                'message': f'Employee profile {action} successfully!',
                'profile': {
                    'id': employee.id,
                    'uuid': str(employee.uuid),
                    'tfn': employee.tfn[:3] + '***' + employee.tfn[-3:],  # Masked TFN for security
                    'bank_account': f"***{employee.account_number[-4:]}"  # Masked account number
                },
                'action': action,
                'next_steps': [
                    'Your employment profile has been saved',
                    'HR team can now process your payroll setup',
                    'You can start accessing employee resources'
                ]
            }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
            
    except ValueError as e:
        return Response({
            'error': 'Invalid data format',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Failed to save employee profile',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ==========================================
# EMPLOYEE PROFILE COMPLETION STATUS
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_employee_profile_completion_status(request):
    """
    Get employee profile completion status
    URL: /api/employee/profile/status/
    """
    
    try:
        membership = CompanyMembership.objects.get(
            user=request.user,
            company__title='Casa Community Pty Ltd',
            role__in=['EMPLOYEE', 'ADMIN', 'SUPPORT_WORKER', 'MANAGER']
        )
    except CompanyMembership.DoesNotExist:
        return Response({
            'error': 'Access denied. Employee account required.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        employee = Employee.objects.get(user=request.user)
        
        # Check required field groups
        required_checks = {
            'basic_info': bool(employee.user.first_name and employee.user.last_name and employee.user.work_email and employee.date_of_birth and employee.address and employee.phone and employee.tfn),
            'bank_details': bool(employee.bank_name and employee.account_name and employee.bsb and employee.account_number),
            'emergency_contact': bool(employee.emergency_contact_first_name and employee.emergency_contact_number and employee.emergency_contact_relationship)
        }
        
        # Check optional field groups
        optional_checks = {
            'location_details': bool(employee.suburb and employee.state_territory and employee.postcode),
            'superannuation': bool(employee.fund_name or employee.abn or employee.member_number),
            'extended_emergency_contact': bool(employee.emergency_contact_last_name and employee.emergency_contact_home)
        }
        
        completed_required = sum(required_checks.values())
        total_required = len(required_checks)
        
        completed_optional = sum(optional_checks.values())
        total_optional = len(optional_checks)
        
        overall_completion = ((completed_required + completed_optional) / (total_required + total_optional)) * 100
        is_profile_complete = completed_required == total_required
        
        return Response({
            'profile_exists': True,
            'is_completed': is_profile_complete,
            'completion_percentage': round(overall_completion, 1),
            'required_fields': {
                'completed': completed_required,
                'total': total_required,
                'status': required_checks
            },
            'optional_fields': {
                'completed': completed_optional,
                'total': total_optional,
                'status': optional_checks
            },
            'recommendations': [
                'Complete basic information (date of birth, address, phone, TFN)' if not required_checks['basic_info'] else None,
                'Add bank details for payroll setup' if not required_checks['bank_details'] else None,
                'Add emergency contact information' if not required_checks['emergency_contact'] else None,
                'Add location details (suburb, state, postcode)' if not optional_checks['location_details'] else None,
                'Add superannuation details' if not optional_checks['superannuation'] else None,
                'Complete emergency contact details' if not optional_checks['extended_emergency_contact'] else None
            ]
        })
        
    except Employee.DoesNotExist:
        return Response({
            'profile_exists': False,
            'is_completed': False,
            'completion_percentage': 0,
            'message': 'Employee profile not created yet',
            'next_steps': ['Create your employee profile to access payroll and HR systems']
        })

# ==========================================
# GET ALL EMPLOYEES (ADMIN ONLY) - UPDATED FOR PROFILES
# ==========================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_get_employees_with_profiles(request):
    """
    Get list of all employees with profile completion status - Admin only
    URL: /api/admin/employees/profiles/
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
    
    # Get all employee memberships
    employee_memberships = CompanyMembership.objects.filter(
        company__title='Casa Community Pty Ltd',
        role__in=['EMPLOYEE', 'SUPPORT_WORKER', 'MANAGER', 'ADMIN']
    ).select_related('user')
    
    employees = []
    profiles_completed = 0
    
    for membership in employee_memberships:
        # Check if employee has completed profile
        try:
            employee_profile = Employee.objects.get(user=membership.user)
            profile_exists = True
            
            # Check if all required fields are completed
            required_complete = all([
                employee_profile.date_of_birth,
                employee_profile.address,
                employee_profile.phone,
                employee_profile.tfn,
                employee_profile.bank_name,
                employee_profile.account_name,
                employee_profile.bsb,
                employee_profile.account_number,
                employee_profile.emergency_contact_first_name,
                employee_profile.emergency_contact_number,
                employee_profile.emergency_contact_relationship
            ])
            
            if required_complete:
                profiles_completed += 1
                
        except Employee.DoesNotExist:
            profile_exists = False
            required_complete = False
        
        employees.append({
            'id': membership.user.id,
            'email': membership.user.work_email,
            'first_name': membership.user.first_name,
            'last_name': membership.user.last_name,
            'role': membership.role,
            'is_active': membership.is_active,
            'joined_at': membership.joined_at.strftime('%Y-%m-%d'),
            'profile_exists': profile_exists,
            'profile_completed': required_complete,
            'is_current_user': membership.user.id == request.user.id
        })
    
    return Response({
        'employees': employees,
        'total_count': len(employees),
        'profiles_completed': profiles_completed,
        'profiles_pending': len(employees) - profiles_completed,
        'completion_rate': round((profiles_completed / len(employees)) * 100, 1) if employees else 0,
        'role_summary': {
            'ADMIN': len([e for e in employees if e['role'] == 'ADMIN']),
            'MANAGER': len([e for e in employees if e['role'] == 'MANAGER']),
            'SUPPORT_WORKER': len([e for e in employees if e['role'] == 'SUPPORT_WORKER']),
            'EMPLOYEE': len([e for e in employees if e['role'] == 'EMPLOYEE'])
        }
    })

